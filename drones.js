
(function(){
"use strict";
// M.A.T · Drones (#/aviones/dron): UAV militares, kamikaze y de guerra, mapa de la guerra de drones, coste dron vs interceptor y cronología.
var EN=window.MAT_LANG==='en'; function L(es,en){return EN?en:es;}
function V(){ var s=document.querySelector('script[data-v]'); return s?s.getAttribute('data-v'):'1'; }
var DATA=null, DP=null, LP=null, MAP=null, C=null, ST={tab:'uav',t:'',k:'',sv:0,q:'',g:'pais',ref:'shahed',open:{}};
function load(){ if(DATA) return Promise.resolve(DATA); if(DP) return DP; DP=window.MAT_GET('drones.json.gz').then(function(d){ DATA=d; return d; }).catch(function(e){ DP=null; throw e; }); return DP; }
function leaflet(){ if(window.L&&window.L.map) return Promise.resolve(window.L); if(LP) return LP;
  LP=new Promise(function(res,rej){ if(!document.querySelector('link[href^="leaflet.css"]')){ var l=document.createElement('link'); l.rel='stylesheet'; l.href='leaflet.css?v='+V(); document.head.appendChild(l); }
    var s=document.createElement('script'); s.src='leaflet.js?v='+V(); s.onload=function(){ if(window.L&&window.L.map) res(window.L); else { LP=null; rej(new Error('leaflet')); } }; s.onerror=function(){ LP=null; rej(new Error('leaflet')); }; document.head.appendChild(s); }); return LP; }
function css(){ if(document.getElementById('dr-css')) return; var s=document.createElement('style'); s.id='dr-css'; s.textContent=
'.dr{--dr-red:#d0623f;--dr-gold:#c9a862}'+
'.dr .dr-hero{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 14px}.dr .dr-stat{flex:1 1 70px;min-width:0;background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:8px 9px}.dr .dr-stat b{display:block;font-size:20px;color:var(--tx);line-height:1.1}.dr .dr-stat span{font-size:11px;color:var(--mu);line-height:1.25;display:block}@media(min-width:700px){.dr .dr-stat{padding:10px 12px}.dr .dr-stat b{font-size:24px}.dr .dr-stat span{font-size:12px}}'+
'.dr .dr-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 14px;padding-bottom:2px;padding-top:2px}.dr .dr-tabs::-webkit-scrollbar{display:none}'+
'.dr .dr-tab{flex:0 0 auto;font:600 13px/1.2 inherit;font-family:inherit;color:var(--mu);background:var(--s1);border:1px solid var(--line);border-radius:999px;padding:9px 13px;cursor:pointer;white-space:nowrap}.dr .dr-tab[aria-selected=true]{color:#111;background:var(--ac2);border-color:var(--ac2)}'+
'.dr .dr-intro{color:var(--mu);font-size:14px;line-height:1.5;margin:0 0 12px}'+
'.dr .dr-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}.dr .dr-ctl select,.dr .dr-ctl input[type=search]{background:var(--s1);color:var(--tx);border:1px solid var(--line);border-radius:6px;padding:8px 10px;font:14px inherit;font-family:inherit;min-width:0}.dr .dr-ctl input[type=search]{flex:1 1 160px}.dr .dr-ctl select{flex:1 1 150px;max-width:260px}'+
'.dr .dr-ctl label{font-size:13px;color:var(--mu);display:flex;align-items:center;gap:6px;white-space:nowrap}'+
'.dr .dr-tdesc{font-size:13px;color:var(--mu);margin:2px 0 10px;min-height:1em}'+
'.dr .dr-grp{border:1px solid var(--line);border-radius:8px;margin:0 0 10px;background:var(--s1);overflow:hidden}.dr .dr-grp>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:10px 12px;font-weight:600}.dr .dr-grp>summary::-webkit-details-marker{display:none}'+
'.dr .dr-grp>summary .flag{width:30px;height:20px;object-fit:cover;border:1px solid var(--line);border-radius:2px;flex:0 0 30px}.dr .dr-grp>summary .n{color:var(--mu);font-weight:400;font-size:13px}.dr .dr-grp>summary .ar{margin-left:auto;color:var(--mu);transition:transform .15s}.dr .dr-grp[open]>summary .ar{transform:rotate(90deg)}'+
'.dr .dr-gl{font-size:12px;color:var(--ac2);text-decoration:none;padding:0 12px 10px;display:inline-block}'+
'.dr .dr-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;padding:0 10px 10px}'+
'.dr .dr-c{display:flex;flex-direction:column;background:var(--s2);border:1px solid var(--line);border-radius:6px;overflow:hidden;text-decoration:none;color:var(--tx);min-width:0}.dr .dr-c:hover{border-color:var(--ac)}'+
'.dr .dr-c .im{aspect-ratio:3/2;background:#0f1112;overflow:hidden}.dr .dr-c .im img{width:100%;height:100%;object-fit:cover;display:block}.dr .dr-c .im>*:not(img){width:100%;height:100%}'+
'.dr .dr-c .tx{padding:7px 8px 8px;display:flex;flex-direction:column;gap:3px;min-width:0}.dr .dr-c .nm{font-size:13.5px;font-weight:600;line-height:1.25;overflow-wrap:anywhere}.dr .dr-c .mt{font-size:11.5px;color:var(--mu);line-height:1.3;display:flex;align-items:center;gap:4px;flex-wrap:wrap}.dr .dr-c .mt .flag{width:16px;height:11px;object-fit:cover;border:1px solid var(--line)}'+
'.dr .dr-tb{display:inline-block;font-size:10.5px;letter-spacing:.02em;border-radius:3px;padding:1px 5px;background:#24282c;color:var(--ac2);border:1px solid #33393e;align-self:flex-start;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dr .dr-tb.g{color:#f0a37f;border-color:#4a3127;background:#2a1d18}'+
'.dr .dr-ret{color:#8a8f94}.dr .dr-dev{color:var(--dr-gold)}'+
'.dr .dr-empty{color:var(--mu);padding:20px 4px}'+
'.dr .dr-map{height:360px;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#0f1112;margin:0 0 8px}@media(min-width:900px){.dr .dr-map{height:470px}}'+
'.dr .dr-map .leaflet-container{font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.dr .dr-map .leaflet-control-attribution{font-size:10px}'+
'.leaflet-tooltip.dr-tt{background:rgba(17,19,21,.92);color:#fff;border:1px solid #555;border-radius:6px;font:600 12px/1.3 -apple-system,Segoe UI,Roboto,sans-serif;padding:2px 7px;box-shadow:none}.leaflet-tooltip.dr-tt:before{display:none}'+
'.dr .dr-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--mu);margin:0 0 12px}.dr .dr-leg i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:5px;vertical-align:-1px}'+
'.dr .dr-cf{background:var(--s1);border:1px solid var(--line);border-radius:8px;padding:12px 13px;margin:0 0 10px;scroll-margin-top:72px}.dr .dr-cf.hl{border-color:var(--dr-red);box-shadow:0 0 0 1px var(--dr-red)}'+
'.dr .dr-cf h3{margin:0 0 2px;font-size:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.dr .dr-cf .per{font-size:12px;color:var(--mu);font-weight:400}.dr .dr-hist{font-size:10px;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--line);color:var(--mu);padding:1px 6px;border-radius:3px}'+
'.dr .dr-cf p{margin:6px 0;font-size:14px;line-height:1.5;color:#d3d4d0}.dr .dr-chips{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}.dr .dr-chip{font-size:12px;border:1px solid var(--line);border-radius:999px;padding:3px 9px;color:var(--tx);text-decoration:none;background:var(--s2)}.dr a.dr-chip{border-color:#4b5536;color:var(--ac2)}.dr .dr-chip small{color:var(--mu)}'+
'.dr .dr-key{border-left:3px solid var(--dr-red);background:#1d1714;padding:8px 10px;border-radius:0 6px 6px 0;font-size:14px;line-height:1.45;margin:8px 0}.dr .dr-key b{color:#f0a37f;font-size:11px;letter-spacing:.06em;text-transform:uppercase;display:block;margin-bottom:2px}'+
'.dr .dr-src{font-size:12px;color:var(--mu);line-height:1.5;margin:6px 0 0;overflow-wrap:anywhere}.dr .dr-src a{color:var(--ac2)}'+
'.dr .dr-est{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.04em;color:#111;background:var(--dr-gold);border-radius:3px;padding:1px 5px;margin-left:5px;vertical-align:1px;white-space:nowrap}'+
'.dr .dr-cost{margin:0 0 14px}.dr .dr-cost h3{font-size:15px;margin:16px 0 8px}.dr .dr-cr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:9px 2px;border-bottom:1px solid var(--line);align-items:baseline}'+
'.dr .dr-cr .nm{font-weight:600;font-size:14px;overflow-wrap:anywhere}.dr .dr-cr .nm a{color:var(--tx)}.dr .dr-cr .pr{font-variant-numeric:tabular-nums;font-weight:700;font-size:14px;text-align:right;white-space:nowrap}.dr .dr-cr .bar{grid-column:1/-1;height:7px;background:#202326;border-radius:4px;overflow:hidden;margin:4px 0 2px}.dr .dr-cr .bar i{display:block;height:100%;border-radius:4px}'+
'.dr .dr-cr .nt{grid-column:1/-1;font-size:12px;color:var(--mu);line-height:1.45}.dr .dr-cr .rt{grid-column:1/-1;font-size:12.5px;color:#f0a37f}.dr .dr-cr sup a{color:var(--ac2);text-decoration:none;font-size:10px;margin-left:2px}'+
'.dr .dr-sim{display:inline-flex;align-items:center;gap:6px;margin:6px 0 14px;padding:10px 14px;border-radius:8px;background:var(--ac2);color:#111;font-weight:700;text-decoration:none;font-size:14px}'+
'.dr .dr-refs{font-size:12px;color:var(--mu);padding-left:20px;line-height:1.55;overflow-wrap:anywhere}.dr .dr-refs a{color:var(--ac2)}'+
'.dr .dr-tl{position:relative;margin:4px 0 10px;padding-left:22px}.dr .dr-tl:before{content:"";position:absolute;left:6px;top:4px;bottom:4px;width:2px;background:var(--line)}'+
'.dr .dr-ti{position:relative;margin:0 0 14px}.dr .dr-ti:before{content:"";position:absolute;left:-21px;top:5px;width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid var(--ac2)}.dr .dr-ti .y{font-weight:800;color:var(--ac2);font-size:15px}.dr .dr-ti p{margin:2px 0 3px;font-size:14px;line-height:1.5;color:#d3d4d0}'+
'.dr .dr-note{font-size:12px;color:var(--mu);line-height:1.5;margin:8px 0}';
 document.head.appendChild(s); }

var CTX, I, BY, P, esc, flag, thumb;
function pn(k){ var p=P[k]; if(!p) return k; return window.MAT_T?window.MAT_T(p.n):p.n; }
function cls(a){ return (DATA.cls&&DATA.cls[a.id])||(a.tipo==='dron'?'tactico':null); }
function grpOf(t){ return DATA.types.guerra.some(function(x){return x[0]===t;})?'guerra':'uav'; }
function tl(t){ var all=DATA.types.uav.concat(DATA.types.guerra); for(var i=0;i<all.length;i++) if(all[i][0]===t) return all[i]; return [t,t,t,'','']; }
function items(g){ return I.filter(function(a){ var c=cls(a); return c&&grpOf(c)===g; }); }
function stat(a){ if(a.dev||/desarroll|development/i.test(a.estado||'')) return ['dev',L('En desarrollo','In development')]; if(a.serv) return ['srv',L('En servicio','In service')]; return ['ret',a.ret&&/cancel/i.test(a.ret)?L('Cancelado','Cancelled'):L('Retirado','Retired')]; }
function card(a){ var c=cls(a), t=tl(c), s=stat(a), o=(a.orig&&a.orig[0])||a.pais;
  return '<a class="dr-c" href="#/a/'+esc(a.id)+'"><div class="im">'+thumb(a)+'</div><div class="tx"><div class="nm">'+esc(a.n)+'</div><span class="dr-tb'+(grpOf(c)==='guerra'?' g':'')+'">'+esc(L(t[1],t[2]))+'</span><div class="mt">'+flag(o)+'<span>'+esc(pn(o))+'</span>'+(a.anio?'<span>· '+a.anio+'</span>':'')+'</div><div class="mt"><span class="'+(s[0]==='ret'?'dr-ret':s[0]==='dev'?'dr-dev':'')+'">'+s[1]+'</span></div></div></a>'; }
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''); }
function opsOf(a){ var k=Object.keys(a.ops||{}); if(!k.length) k=[a.pais]; return k; }

function catalog(g){
  var all=items(g), types=DATA.types[g];
  var cnt={}; all.forEach(function(a){ opsOf(a).forEach(function(k){ if(P[k]) cnt[k]=(cnt[k]||0)+1; }); });
  var ks=Object.keys(cnt).sort(function(x,y){ return (y==='espana')-(x==='espana')||cnt[y]-cnt[x]||pn(x).localeCompare(pn(y)); });
  if(ST.k&&!cnt[ST.k]) ST.k=''; if(ST.t&&!types.some(function(x){return x[0]===ST.t;})) ST.t='';
  var tc={}; all.forEach(function(a){ var c=cls(a); tc[c]=(tc[c]||0)+1; });
  var h='<p class="dr-intro">'+(g==='uav'?L('Drones de vigilancia, reconocimiento y combate de todos los países. Filtra por tipo o por país, o busca un modelo; cada tarjeta abre su ficha.','Surveillance, reconnaissance and combat drones of every country. Filter by type or country, or search a model; each card opens its entry.'):L('Los drones que más se usan en las guerras de hoy: de ataque de un solo uso («kamikaze»), municiones merodeadoras, FPV y drones comerciales adaptados, antidrones y drones navales.','The drones most used in today\'s wars: one-way attack ("kamikaze") drones, loitering munitions, FPV and adapted commercial drones, counter-drone systems and naval drones.'))+'</p>';
  h+='<div class="chips" role="group" aria-label="'+L('Tipo','Type')+'"><button class="chip dr-t" data-t="" aria-pressed="'+(!ST.t)+'">'+L('Todos','All')+' ('+all.length+')</button>'+types.filter(function(x){return tc[x[0]];}).map(function(x){ return '<button class="chip dr-t" data-t="'+x[0]+'" aria-pressed="'+(ST.t===x[0])+'">'+esc(L(x[1],x[2]))+' ('+tc[x[0]]+')</button>'; }).join('')+'</div>';
  h+='<p class="dr-tdesc" id="dr-tdesc"></p>';
  h+='<div class="dr-ctl"><input type="search" id="dr-q" placeholder="'+L('Buscar modelo…','Search model…')+'" value="'+esc(ST.q)+'" aria-label="'+L('Buscar','Search')+'"><select id="dr-k" aria-label="'+L('País','Country')+'"><option value="">'+L('Todos los países','All countries')+' ('+ks.length+')</option>'+ks.map(function(k){ return '<option value="'+k+'"'+(ST.k===k?' selected':'')+'>'+esc(pn(k))+' ('+cnt[k]+')</option>'; }).join('')+'</select>'+
    '<select id="dr-g" aria-label="'+L('Agrupar','Group')+'"><option value="pais"'+(ST.g==='pais'?' selected':'')+'>'+L('Agrupar por país','Group by country')+'</option><option value="tipo"'+(ST.g==='tipo'?' selected':'')+'>'+L('Agrupar por tipo','Group by type')+'</option></select>'+
    '<label><input type="checkbox" id="dr-sv"'+(ST.sv?' checked':'')+'> '+L('Solo en servicio','In service only')+'</label></div><div id="dr-res"></div>';
  if(g==='uav') h+='<p class="dr-note">'+L('País = operador según la ficha (como en el resto de M.A.T); un modelo aparece en cada país que lo usa. Tipo asignado por M.A.T según el papel, el peso y la autonomía que da la fuente de cada ficha.','Country = operator per the entry (as elsewhere in M.A.T); a model appears under every country that uses it. Type assigned by M.A.T from the role, weight and endurance given by each entry\'s source.')+'</p>';
  else h+='<p class="dr-note">'+L('Shahed-136, Harop y Lancet están en Armamento y los drones navales en Buques: sus tarjetas abren esas fichas. Los modelos civiles aparecen porque se usan en combate, no porque los fabricantes los vendan como armas.','Shahed-136, Harop and Lancet are filed under Weapons and naval drones under Ships: their cards open those entries. Civilian models appear because they are used in combat, not because their makers sell them as weapons.')+'</p>';
  return h;
}
function drawCat(g){
  var res=document.getElementById('dr-res'); if(!res) return;
  var all=items(g), q=norm(ST.q);
  var Lst=all.filter(function(a){ return (!ST.t||cls(a)===ST.t)&&(!ST.sv||a.serv)&&(!ST.k||opsOf(a).indexOf(ST.k)>=0)&&(!q||norm(a.n+' '+(a.k||[]).join(' ')).indexOf(q)>=0); }).sort(function(a,b){ return (b.serv?1:0)-(a.serv?1:0)||(b.anio||0)-(a.anio||0)||a.n.localeCompare(b.n); });
  var d=document.getElementById('dr-tdesc'); if(d){ var tt=ST.t?tl(ST.t):null; d.textContent=tt?L(tt[3],tt[4]):''; }
  if(!Lst.length){ res.innerHTML='<p class="dr-empty">'+L('Ningún modelo con estos filtros.','No models match these filters.')+'</p>'; return; }
  var filtered=!!(ST.t||ST.q||ST.sv||ST.k), h='';
  if(ST.g==='tipo'||ST.k){
    DATA.types[g].forEach(function(x){ var S=Lst.filter(function(a){return cls(a)===x[0];}); if(!S.length) return;
      var key='t_'+x[0], op=ST.open[key]!=null?ST.open[key]:true;
      h+='<details class="dr-grp" data-key="'+key+'"'+(op?' open':'')+'><summary><span>'+esc(L(x[1],x[2]))+'</span><span class="n">'+S.length+'</span><span class="ar">›</span></summary><div class="dr-cards">'+S.map(card).join('')+'</div></details>'; });
  } else {
    var cnt={}; Lst.forEach(function(a){ opsOf(a).forEach(function(k){ if(P[k]) cnt[k]=(cnt[k]||0)+1; }); });
    var ks=Object.keys(cnt).sort(function(x,y){ return (y==='espana')-(x==='espana')||cnt[y]-cnt[x]||pn(x).localeCompare(pn(y)); });
    ks.forEach(function(k,i){ var S=Lst.filter(function(a){ return opsOf(a).indexOf(k)>=0; }); var key='p_'+k, op=ST.open[key]!=null?ST.open[key]:(filtered||i<3);
      var dronAv=S.some(function(a){return a.tipo==='dron';});
      h+='<details class="dr-grp" data-key="'+key+'"'+(op?' open':'')+'><summary>'+flag(k)+'<span>'+esc(pn(k))+'</span><span class="n">'+S.length+'</span><span class="ar">›</span></summary><div class="dr-cards">'+S.map(card).join('')+'</div>'+(g==='uav'&&dronAv?'<a class="dr-gl" href="#/aviones/dron/'+k+'">'+L('Lista con orden y filtros de época','List with sorting and era filters')+' ›</a>':'')+'</details>'; });
  }
  res.innerHTML=h;
  [].forEach.call(res.querySelectorAll('details.dr-grp'),function(dt){ dt.addEventListener('toggle',function(){ ST.open[dt.getAttribute('data-key')]=dt.open; }); });
}
function bindCat(g){
  var R=document.getElementById('dr-body');
  [].forEach.call(R.querySelectorAll('.dr-t'),function(b){ b.onclick=function(){ ST.t=b.getAttribute('data-t'); ST.open={}; [].forEach.call(R.querySelectorAll('.dr-t'),function(x){ x.setAttribute('aria-pressed',String(x===b)); }); drawCat(g); }; });
  var q=document.getElementById('dr-q'); q.oninput=function(){ ST.q=q.value; ST.open={}; drawCat(g); };
  document.getElementById('dr-k').onchange=function(){ ST.k=this.value; ST.open={}; drawCat(g); };
  document.getElementById('dr-g').onchange=function(){ ST.g=this.value; ST.open={}; drawCat(g); };
  document.getElementById('dr-sv').onchange=function(){ ST.sv=this.checked?1:0; drawCat(g); };
  drawCat(g);
}

// ---- conflictos / mapa
function srcLinks(arr){ return (arr||[]).map(function(s){ return '<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>'+(s[2]?' ('+esc(fd(s[2]))+')':''); }).join(' · '); }
function fd(s){ s=String(s||''); var pre=''; var c=/^consultado\s+/.exec(s); if(c){ pre=L('consultado ','retrieved '); s=s.slice(c[0].length); } var M=EN?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']; var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if(m) return pre+(+m[3])+' '+M[+m[2]-1]+' '+m[1]; m=/^(\d{4})-(\d{2})$/.exec(s); if(m) return pre+M[+m[2]-1]+' '+m[1]; return pre+s; }
function droneId(name){ var A=DATA.alias||{}, ks=Object.keys(A).sort(function(a,b){return b.length-a.length;}), n=String(name).toLowerCase(); for(var i=0;i<ks.length;i++){ if(n.indexOf(ks[i].toLowerCase())>=0&&BY[A[ks[i]]]) return A[ks[i]]; } return null; }
function who(w){ if(Array.isArray(w)) return L(w[0],w[1]); return String(w||''); }
function conflicts(){
  var CF=DATA.conflicts||[];
  var h='<p class="dr-intro">'+L('Dónde se usan los drones ahora y en guerras recientes. Toca un punto del mapa para ir a su ficha; cada dato lleva su fuente y su fecha.','Where drones are being used now and in recent wars. Tap a point on the map to jump to its card; every figure carries its source and date.')+'</p>';
  h+='<div class="dr-map" id="dr-map" role="img" aria-label="'+L('Mapa de conflictos con drones','Map of drone conflicts')+'"></div><div class="dr-leg"><span><i style="background:#d0623f"></i>'+L('En curso o reciente','Ongoing or recent')+'</span><span><i style="background:#8a8f94"></i>'+L('Histórico','Historic')+'</span></div>';
  h+=CF.map(function(c){ var ds=(c.drones||[]).map(function(d){ var nm=Array.isArray(d[0])?d[0]:[d[0],d[0]]; var id=droneId(nm[0]); var lab=esc(L(nm[0],nm[1]))+(d[1]?' <small>· '+esc(who(d[1]))+'</small>':''); return id?'<a class="dr-chip" href="#/a/'+id+'">'+lab+'</a>':'<span class="dr-chip">'+lab+'</span>'; }).join('');
    var ks=c.src&&c.src[c.dato_src||0];
    return '<div class="dr-cf" id="dr-cf-'+esc(c.id)+'"><h3>'+esc(L(c.n[0],c.n[1]))+' <span class="per">'+esc(c.per||'')+'</span>'+(c.hist?'<span class="dr-hist">'+L('Histórico','Historic')+'</span>':'')+'</h3>'+
      (ds?'<div class="dr-chips">'+ds+'</div>':'')+'<p>'+esc(L(c.txt[0],c.txt[1]))+'</p>'+
      (c.dato?'<div class="dr-key"><b>'+L('Dato clave','Key fact')+(c.fecha?' · '+esc(fd(c.fecha)):'')+'</b>'+esc(L(c.dato[0],c.dato[1]))+(c.est?'<span class="dr-est">'+L('Estimación','Estimate')+'</span>':'')+(ks?' — <a href="'+esc(ks[1])+'" target="_blank" rel="noopener" style="color:var(--ac2)">'+esc(ks[0])+'</a>':'')+'</div>':'')+
      '<div class="dr-src">'+L('Fuentes','Sources')+': '+srcLinks(c.src)+'</div></div>'; }).join('');
  return h;
}
function mapInit(){
  var el=document.getElementById('dr-map'); if(!el) return;
  leaflet().then(function(Lf){ if(!document.getElementById('dr-map')) return; if(MAP){ try{MAP.remove();}catch(e){} MAP=null; }
    MAP=Lf.map('dr-map',{zoomControl:true,worldCopyJump:true,scrollWheelZoom:false,minZoom:2}); MAP.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:12,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> '+L('colaboradores','contributors')}).addTo(MAP);
    var pts=[];
    (DATA.conflicts||[]).forEach(function(c){ var col=c.hist?'#8a8f94':'#d0623f';
      if(c.zona&&c.zona.length>2) Lf.polygon(c.zona,{color:col,weight:1.5,opacity:.85,fillColor:col,fillOpacity:.14,interactive:false}).addTo(MAP);
      var m=Lf.circleMarker([c.lat,c.lon],{radius:9,color:'#fff',weight:2,fillColor:col,fillOpacity:.95}).addTo(MAP);
      var td=c.td||'top', off={top:[0,-8],bottom:[0,8],left:[-8,0],right:[8,0]}[td]||[0,-8]; m.bindTooltip(L(c.n[0],c.n[1]),{className:'dr-tt',direction:td,offset:off,permanent:window.innerWidth>=700});
      m.on('click',function(){ var cd=document.getElementById('dr-cf-'+c.id); if(cd){ [].forEach.call(document.querySelectorAll('.dr-cf.hl'),function(x){x.classList.remove('hl');}); cd.classList.add('hl'); cd.scrollIntoView({behavior:'smooth',block:'start'}); } });
      pts.push([c.lat,c.lon]); });
    if(pts.length) MAP.fitBounds(Lf.latLngBounds(pts).pad(0.15)); else MAP.setView([30,30],2);
    setTimeout(function(){ if(MAP) MAP.invalidateSize(); },200);
  }).catch(function(){ el.innerHTML='<p class="dr-empty" style="padding:16px">'+L('No se pudo cargar el mapa.','The map could not be loaded.')+'</p>'; });
}

// ---- coste
function usd(v){ if(v==null) return '—'; if(v>=1e6){ var x=v/1e6; return (EN?'$':'')+(x>=10?x.toFixed(1):x.toFixed(x<1?3:2)).replace(/\.?0+$/,'').replace('.',EN?'.':',')+(EN?'M':' M$'); } var s=Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,EN?',':'.'); return EN?'$'+s:s+' $'; }
function rng(c){ return c[0]===c[1]?usd(c[0]):(EN?usd(c[0])+'–'+usd(c[1]).replace('$',''):usd(c[0]).replace(' $','')+'–'+usd(c[1])); }
function mid(c){ return Math.sqrt(c[0]*c[1]); }
function cost(){
  var R=DATA.costs||[], dr=R.filter(function(r){return r.k==='dron';}).sort(function(a,b){return mid(a.c)-mid(b.c);}), it=R.filter(function(r){return r.k==='int';}).sort(function(a,b){return mid(a.c)-mid(b.c);});
  var refs=[], ri={}; function ref(s){ var k=s[1]; if(ri[k]==null){ ri[k]=refs.length; refs.push(s); } return ri[k]+1; }
  var lo=Math.log10(100), hi=Math.log10(15e6);
  function bar(c,col){ var a=(Math.log10(Math.max(c[0],100))-lo)/(hi-lo)*100, b=(Math.log10(Math.max(c[1],100))-lo)/(hi-lo)*100; b=Math.max(b,a+1.5); return '<div class="bar" aria-hidden="true"><i style="margin-left:'+a.toFixed(1)+'%;width:'+(b-a).toFixed(1)+'%;background:'+col+'"></i></div>'; }
  var refR=dr.filter(function(r){return r.id===ST.ref;})[0]||dr[0];
  function row(r,isInt){ var f=r.f&&BY[r.f]?r.f:null, nm=esc(L(r.n[0],r.n[1]));
    var sups=(r.src||[]).map(function(s){ var n=ref(s); return '<a href="#dr-ref-'+n+'" title="'+esc(s[0])+'">['+n+']</a>'; }).join('');
    var ratio=''; if(isInt&&refR){ var x=mid(r.c)/mid(refR.c), sn=refR.sn||refR.n; ratio='<div class="rt">'+(x>=1?L('≈ '+fmtN(x)+' veces el coste de un '+sn[0],'≈ '+fmtN(x)+' × the cost of one '+sn[1]):L('Más barato: un '+sn[0]+' cuesta lo que ≈ '+fmtN(1/x)+' de estos','Cheaper: one '+sn[1]+' costs as much as ≈ '+fmtN(1/x)+' of these'))+'</div>'; }
    return '<div class="dr-cr"><div class="nm">'+(f?'<a href="#/a/'+f+'">'+nm+'</a>':nm)+(r.est?'<span class="dr-est">'+L('Estimación','Estimate')+'</span>':'')+'<sup>'+sups+'</sup></div><div class="pr">'+rng(r.c)+'</div>'+bar(r.c,isInt?'#6f8fb3':'#d0623f')+ratio+'<div class="nt">'+esc(L(r.nota[0],r.nota[1]))+'</div></div>'; }
  var h='<p class="dr-intro">'+L('Un dron de ataque barato obliga al defensor a gastar munición mucho más cara. Precios por unidad (dron) y por disparo o interceptor (defensa), en dólares de la fecha de cada fuente; las barras van en escala logarítmica de 100 $ a 15 M$.','A cheap attack drone forces the defender to spend far more expensive munitions. Prices per unit (drone) and per shot or interceptor (defence), in dollars of each source\'s date; bars on a logarithmic scale from $100 to $15M.')+'</p>';
  h+='<a class="dr-sim" href="#/guerra-nuclear?tab=defensa">🛡️ '+L('Pruébalo en el simulador de defensa aérea','Try it in the air-defence simulator')+' ›</a>';
  h+='<div class="dr-cost"><h3>'+L('Lo que cuesta el dron','What the drone costs')+'</h3>'+dr.map(function(r){return row(r,false);}).join('')+'</div>';
  h+='<div class="dr-ctl"><label for="dr-ref">'+L('Comparar cada defensa con:','Compare each defence with:')+'</label><select id="dr-ref">'+dr.map(function(r){ return '<option value="'+esc(r.id)+'"'+(refR&&r.id===refR.id?' selected':'')+'>'+esc(L(r.n[0],r.n[1]))+' ('+rng(r.c)+')</option>'; }).join('')+'</select></div>';
  h+='<div class="dr-cost"><h3>'+L('Lo que cuesta derribarlo','What it costs to shoot it down')+'</h3>'+it.map(function(r){return row(r,true);}).join('')+'</div>';
  h+='<p class="dr-note">'+L('La comparación usa el punto medio (media geométrica) de cada rango. No incluye el lanzador, el radar ni el daño que causa el dron si no se derriba, y a menudo se disparan dos interceptores por blanco. «Estimación» = no hay cifra pública fiable o procede de una sola fuente débil.','The comparison uses the midpoint (geometric mean) of each range. It excludes the launcher, the radar and the damage the drone causes if not shot down, and two interceptors are often fired per target. "Estimate" = no reliable public figure, or a single weak source.')+'</p>';
  h+='<h3 style="font-size:14px;margin:14px 0 6px">'+L('Fuentes','Sources')+'</h3><ol class="dr-refs">'+refs.map(function(s,i){ return '<li id="dr-ref-'+(i+1)+'"><a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>'+(s[2]?' ('+esc(fd(s[2]))+')':'')+'</li>'; }).join('')+'</ol>';
  return h;
}
function fmtN(x){ if(x>=100) return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g,EN?',':'.'); if(x>=10) return String(Math.round(x)); if(x>=1) return x.toFixed(1).replace('.',EN?'.':','); return x.toFixed(2).replace('.',EN?'.':','); }

function crono(){ var T=DATA.timeline||[];
  return '<p class="dr-intro">'+L('Del primer «torpedo aéreo» de 1918 a los enjambres de hoy: los hitos de los drones militares.','From the first "aerial torpedo" of 1918 to today\'s swarms: the milestones of military drones.')+'</p><div class="dr-tl">'+T.map(function(t){ return '<div class="dr-ti"><div class="y">'+esc(t.y)+'</div><p>'+esc(L(t.t[0],t.t[1]))+'</p><div class="dr-src">'+srcLinks(t.src)+'</div></div>'; }).join('')+'</div>'; }

var TABS=[['uav',['UAV militares','Military UAVs']],['guerra',['Kamikaze y de guerra','Kamikaze & war drones']],['mapa',['Guerra de drones','Drone warfare']],['coste',['Coste dron vs interceptor','Drone vs interceptor cost']],['crono',['Cronología','Timeline']]];
function body(){
  var B=document.getElementById('dr-body'); if(!B) return; if(MAP){ try{MAP.remove();}catch(e){} MAP=null; }
  var t=ST.tab;
  if(t==='uav'||t==='guerra'){ B.innerHTML=catalog(t); bindCat(t); }
  else if(t==='mapa'){ B.innerHTML=conflicts(); mapInit(); }
  else if(t==='coste'){ B.innerHTML=cost(); var s=document.getElementById('dr-ref'); if(s) s.onchange=function(){ ST.ref=s.value; var y=window.scrollY; body(); window.scrollTo(0,y); }; }
  else { B.innerHTML=crono(); }
}
function setTab(t,push){ if(ST.tab!==t||!ST.init){ ST.t=''; ST.k=''; ST.q=''; ST.open={}; ST.g=t==='guerra'?'tipo':'pais'; ST.init=1; } ST.tab=t; [].forEach.call(document.querySelectorAll('.dr-tab'),function(b){ b.setAttribute('aria-selected',String(b.getAttribute('data-tab')===t)); });
  if(push){ var h='#/aviones/dron'+(t==='uav'?'':'?tab='+t); try{ history.replaceState(history.state,'',h); }catch(e){} }
  body(); }
window.MAT_DRONES=function(app,ctx){
  CTX=ctx; I=ctx.I; BY=ctx.BY; P=ctx.P; esc=ctx.esc; flag=ctx.flag; thumb=ctx.thumb; css();
  var q=ctx.qs(), t=q.tab; if(!TABS.some(function(x){return x[0]===t;})) t='uav';
  var cr=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Aviones','Aircraft'),'#/aviones'],['Drones']]);
  ctx.set('<div data-noi18n>'+cr+'<h1>Drones</h1><p class="sub" data-noi18n>'+L('Cargando…','Loading…')+'</p></div>','Drones');
  load().then(function(){
    if(!/^#\/aviones\/dron\/?(\?|$)/.test(location.hash)) return;
    var nu=items('uav').length, ng=items('guerra').length, pk={}; items('uav').concat(items('guerra')).forEach(function(a){ opsOf(a).forEach(function(k){ if(P[k]) pk[k]=1; }); });
    var h='<div class="dr" data-noi18n>'+cr+'<h1>Drones</h1><p class="sub">'+L('UAV militares, drones kamikaze y de guerra, dónde se están usando y lo que cuesta derribarlos.','Military UAVs, kamikaze and war drones, where they are being used and what it costs to shoot them down.')+'</p>'+
      '<div class="dr-hero"><div class="dr-stat"><b>'+nu+'</b><span>'+L('UAV militares','military UAVs')+'</span></div><div class="dr-stat"><b>'+ng+'</b><span>'+L('kamikaze y de guerra','kamikaze & war drones')+'</span></div><div class="dr-stat"><b>'+Object.keys(pk).length+'</b><span>'+L('países operadores','operator countries')+'</span></div><div class="dr-stat"><b>'+(DATA.conflicts||[]).length+'</b><span>'+L('conflictos en el mapa','conflicts on the map')+'</span></div></div>'+
      '<div class="dr-tabs" role="tablist">'+TABS.map(function(x){ return '<button type="button" role="tab" class="dr-tab" data-tab="'+x[0]+'" aria-selected="'+(x[0]===t)+'">'+L(x[1][0],x[1][1])+'</button>'; }).join('')+'</div><div id="dr-body"></div>'+
      '<p class="dr-note">'+L('Datos de las fichas de M.A.T (Wikipedia y prensa citada en cada una); conflictos, costes y cronología con su fuente en cada dato. Consultado el ','Data from M.A.T entries (Wikipedia and press cited in each); conflicts, costs and timeline with their source on every figure. Retrieved ')+esc(fd(DATA.upd||''))+'.</p></div>';
    ctx.set(h,'Drones');
    [].forEach.call(document.querySelectorAll('.dr-tab'),function(b){ b.onclick=function(){ setTab(b.getAttribute('data-tab'),true); var tb=document.querySelector('.dr-tabs'); if(tb&&tb.getBoundingClientRect().top<0) tb.scrollIntoView({block:'start'}); }; });
    ST.tab=t; setTab(t,false);
  }).catch(function(){ ctx.set(cr+'<h1>Drones</h1><p class="sub">'+L('No se pudo cargar. Comprueba la conexión.','Could not load. Check your connection.')+'</p>','Drones'); });
};
})();
