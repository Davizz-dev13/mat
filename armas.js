(function(){
"use strict";
// M.A.T · Armas ligeras (#/armas): pistolas, subfusiles, fusiles, ametralladoras y escopetas. Datos: armas.json.gz (+ armas_d.json.gz al abrir ficha), traducidos de Wikipedia; fotos libres de Wikimedia Commons.
function EN(){return window.MAT_LANG==='en';}
function L(es,en){return EN()?en:es;}
var TY=[
 ['g_pistola','Pistolas','Pistols','Semiautomáticas reglamentarias, de la Luger y la Colt M1911 a la Glock','Service semi-automatic pistols, from the Luger and Colt M1911 to the Glock','g-luger-pistol'],
 ['g_revolver','Revólveres','Revolvers','Revólveres militares de las dos guerras mundiales y posteriores','Military revolvers of both world wars and later','g-webley-revolver'],
 ['g_subfusil','Subfusiles','Submachine guns','De la Thompson y el MP 40 al MP5, el P90 y el MP7','From the Thompson and MP 40 to the MP5, P90 and MP7','g-thompson-submachine-gun'],
 ['g_cerrojo','Fusiles de cerrojo e históricos','Bolt-action and historic rifles','Mauser, Lee-Enfield, Mosin-Nagant, M1 Garand… los fusiles de las dos guerras mundiales','Mauser, Lee–Enfield, Mosin–Nagant, M1 Garand… the rifles of both world wars','g-karabiner-98k'],
 ['g_asalto','Fusiles de asalto','Assault rifles','Del StG 44 y el AK-47 al M16, G36, HK416, SCAR y AK-12','From the StG 44 and AK-47 to the M16, G36, HK416, SCAR and AK-12','g-ak-47'],
 ['g_batalla','Fusiles de combate (de batalla)','Battle rifles','Fusiles de calibre completo: CETME, G3, FN FAL, M14…','Full-power rifles: CETME, G3, FN FAL, M14…','g-fn-fal'],
 ['g_carabina','Carabinas','Carbines','Fusiles cortos: M1, M4, SKS, AKS-74U…','Short rifles: M1, M4, SKS, AKS-74U…','g-m4-carbine'],
 ['g_dmr','Fusiles de tirador designado','Designated marksman rifles','Semiautomáticos de precisión para el tirador de la escuadra','Semi-automatic precision rifles for the squad marksman','g-mk-14-enhanced-battle-rifle'],
 ['g_franco','Fusiles de francotirador y antimaterial','Sniper and anti-materiel rifles','Dragunov, M24, AWM, Barrett M82, TAC-50…','Dragunov, M24, AWM, Barrett M82, TAC-50…','g-barrett-m82'],
 ['g_amet_ligera','Ametralladoras ligeras','Light machine guns','De la Lewis, la BAR y la Bren a la Minimi, la MG4 y la Negev','From the Lewis, BAR and Bren to the Minimi, MG4 and Negev','g-fn-minimi'],
 ['g_amet_media','Ametralladoras medias, pesadas y de propósito general','Medium, heavy and general-purpose machine guns','Maxim, MG 42, M60, PKM, MG3, M240, M2 Browning…','Maxim, MG 42, M60, PKM, MG3, M240, M2 Browning…','g-mg-42'],
 ['g_escopeta','Escopetas de combate','Combat shotguns','Escopetas de trinchera, de corredera y semiautomáticas','Trench, pump-action and semi-automatic shotguns','g-benelli-m4']
];
var TYM={}; TY.forEach(function(t){TYM[t[0]]=t;});
var ERA=[['ww1','1.ª Guerra Mundial','World War I'],['entre','Entreguerras','Interwar'],['ww2','2.ª Guerra Mundial','World War II'],['fria','Guerra Fría','Cold War'],['actual','Actualidad','Today']];
var ERAM={xix:['Siglo XIX','19th century']}; ERA.forEach(function(e){ERAM[e[0]]=[e[1],e[2]];});
var GH={xix:['Antes de 1900','Before 1900'],ww1:['1900–1918 · 1.ª Guerra Mundial','1900–1918 · World War I'],entre:['1919–1938 · Entreguerras','1919–1938 · Interwar'],ww2:['1939–1945 · 2.ª Guerra Mundial','1939–1945 · World War II'],fria:['1946–1991 · Guerra Fría','1946–1991 · Cold War'],actual:['Desde 1992','Since 1992']};
var SORTS=[['crono','Orden cronológico','Chronological'],['new','Más recientes primero','Newest first'],['cad','Más cadencia de tiro','Highest rate of fire'],['vb','Más velocidad de boca','Highest muzzle velocity'],['alc','Más alcance eficaz','Longest effective range'],['ligera','Más ligeras primero','Lightest first'],['az','Nombre (A-Z)','Name (A–Z)']];
var st={q:'',sort:'crono',era:'',pais:'',mun:'',serv:false};
function X(){return window.MAT_AX||{};}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nf(n,d){if(n==null)return '';return Number(n).toLocaleString(EN()?'en-GB':'es-ES',{maximumFractionDigits:d==null?0:d});}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-\s.·×]/g,'');}
function pn(k){var P=X().P||{}; var n=P[k]?P[k].n:k; return EN()&&window.MAT_T?window.MAT_T(n):n;}
function flag(k,c){var P=X().P||{}; return P[k]?'<img class="'+(c||'flag')+'" src="'+P[k].flag+'" alt="" loading="lazy">':'';}
function all(){return (X().I||[]).filter(function(a){return a.cat==='armas';});}
function inEra(a,e){return a.era===e||(a.eras&&a.eras.indexOf(e)>=0);}
function orgLbl(a){return a.estado_pais||(a.orig&&a.orig.length>1?a.orig.map(pn).join(' / '):pn(a.pais));}
function svc(a){return a.serv?L('En servicio','In service'):L('Fuera de servicio','Out of service');}
function th(a){return a.img?'<img src="'+esc(a.img.th)+'" data-fb="'+esc(a.img.src)+'" alt="" loading="lazy" decoding="async">':'<div class="gph" aria-hidden="true">'+ICO+'</div>';}
var ICO='<svg viewBox="0 0 64 32" width="56" height="28" fill="currentColor"><path d="M2 12h40l2-3h6v3h12v4H44l-2 2h-6l-2 7h-7l2-7H18l-4 6H6l3-6H2z"/></svg>';
function css(){ if(document.getElementById('gcss')) return; var s=document.createElement('style'); s.id='gcss';
 s.textContent='.gph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--dim,#6b7177);background:rgba(255,255,255,.03)}'+
 '.gctl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.gctl .inp{grid-column:1/-1}.gctl .sel{min-width:0;width:100%}.gctl #gmu{grid-column:1/-1}'+
 '.gchips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}'+
 '.grt{font-size:12.5px;color:var(--mu,#9aa0a6);white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}'+
 '.gusr{display:flex;flex-direction:column;gap:0}.gusr .row{min-height:44px}.gusr .nm{font-size:14.5px}'+
 'details.gfold{margin:8px 0}details.gfold>summary{cursor:pointer;color:var(--mu,#9aa0a6);font-size:14px;padding:6px 0}'+
 '.gkpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.gkpis>div{background:rgba(255,255,255,.04);border-radius:10px;padding:8px 9px;min-width:0}.gkpis .kv{font-weight:700;font-size:14px;line-height:1.25;overflow-wrap:anywhere}.gkpis .kk{font-size:11.5px;color:var(--mu,#9aa0a6);margin-top:2px}'+
 '.gcred{font-size:11.5px;color:var(--dim,#6b7177);margin:4px 0 0;line-height:1.35;overflow-wrap:anywhere}.gcred a{color:var(--mu,#9aa0a6)}'+
 '.gdiv{font-size:12px;color:var(--mu,#9aa0a6)}'+
 '#app .row .ds img.mini{width:16px!important;height:11px!important;max-width:none;object-fit:cover;display:inline-block;vertical-align:-1px;margin:0 5px 0 0;border-radius:0}'+
 '@media (min-width:700px){.gctl{grid-template-columns:2fr 1fr 1fr 1fr}.gctl .inp,.gctl #gmu{grid-column:auto}.gkpis{grid-template-columns:repeat(6,minmax(0,1fr))}}';
 document.head.appendChild(s); }
function first(s,n){ if(!s) return ''; var x=String(s).split(/\s*;\s*/)[0]; n=n||48; return x.length>n?x.slice(0,n-1)+'…':x; }
function crumbs(list){return X().crumbs(list);}
function setp(h,t){X().set(h,t);}
function rt(a,s){ if(s==='cad'&&a.cad) return nf(a.cad)+'/min'; if(s==='vb'&&a.vb) return nf(a.vb)+' m/s'; if(s==='alc'&&a.alc) return nf(a.alc)+' m'; if(s==='ligera'&&a.peso) return nf(a.peso,2)+' kg'; return ''; }
function row(a,s){ var fav=X().isFav&&X().isFav(a);
 var m=EN()?(a.mun_en||a.mun):a.mun; var r=rt(a,s);
 return '<a class="row" href="#/a/'+a.id+'"><div class="th">'+th(a)+'</div><div class="m"><div class="nm">'+esc(a.n)+(fav?' <span class="favs">★</span>':'')+'</div><div class="ds">'+(a.anio||'—')+' · <span class="org">'+flag(a.pais,'mini')+'</span>'+esc(orgLbl(a))+(m?' · '+esc(m):'')+(a.serv?'':' · <span class="gdiv">'+esc(L('fuera de servicio','out of service'))+'</span>')+'</div></div>'+(r?'<div class="grt">'+r+'</div>':'')+'<div class="ch">›</div></a>'; }
function sorter(s){ return {
 crono:function(a,b){return (a.anio||9999)-(b.anio||9999)||a.n.localeCompare(b.n);},
 new:function(a,b){return (b.anio||0)-(a.anio||0);},
 cad:function(a,b){return (b.cad||0)-(a.cad||0);},
 vb:function(a,b){return (b.vb||0)-(a.vb||0);},
 alc:function(a,b){return (b.alc||0)-(a.alc||0);},
 ligera:function(a,b){return (a.peso||1e9)-(b.peso||1e9);},
 az:function(a,b){return a.n.localeCompare(b.n);} }[s]||function(){return 0;}; }
function home(){
 var A=all(), npais={}; A.forEach(function(a){Object.keys(a.ops||{}).forEach(function(k){npais[k]=1;});});
 var h=crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms')]])+'<h1>'+L('Armas ligeras','Small arms')+'</h1><p class="sub">'+L(A.length+' armas de la Primera Guerra Mundial a hoy: pistolas, subfusiles, fusiles, ametralladoras y escopetas. Cada ficha con munición, cadencia, alcance, peso, guerras y los países que la usan.',A.length+' weapons from World War I to today: pistols, submachine guns, rifles, machine guns and shotguns. Each entry has ammunition, rate of fire, range, weight, wars and the countries that use it.')+'</p>';
 h+='<div class="ctrl"><input class="inp" id="gq" type="search" placeholder="'+L('Buscar arma, p. ej. Thompson, AK-47, G36','Search, e.g. Thompson, AK-47, G36')+'" autocomplete="off" value="'+esc(st.q)+'"></div><div id="gres"></div><div id="gcats"><div class="list">';
 TY.forEach(function(t){ var n=A.filter(function(a){return a.tipo===t[0]||(a.alt&&a.alt.indexOf(t[0])>=0);}).length; if(!n) return; var BY=X().BY||{}; var pic=BY[t[5]]&&BY[t[5]].img?BY[t[5]]:A.filter(function(a){return a.tipo===t[0]&&a.img;})[0];
  h+='<a class="row" href="#/armas/'+t[0].slice(2).replace(/_/g,'-')+'"><div class="th">'+(pic?th(pic):'')+'</div><div class="m"><div class="nm">'+L(t[1],t[2])+'</div><div class="ds">'+L(t[3],t[4])+'</div></div><div class="rt">'+n+'</div><div class="ch">›</div></a>'; });
 h+='<a class="row" href="#/armas/todas"><div class="th">'+(X().BY&&X().BY['g-m16-rifle']?th(X().BY['g-m16-rifle']):'')+'</div><div class="m"><div class="nm">'+L('Todas las armas','All weapons')+'</div><div class="ds">'+L('Con filtros por época, país, calibre y en servicio','With filters by era, country, calibre and in service')+'</div></div><div class="rt">'+A.length+'</div><div class="ch">›</div></a></div></div>';
 h+='<p class="note">'+L('Datos traducidos de Wikipedia (ficha técnica y texto de cada artículo, enlazado en cada ficha); si la fuente no da un dato, no aparece. Fotos libres de Wikimedia Commons con su autor y licencia en cada ficha.','Data from Wikipedia (infobox and text of each article, linked on every entry); if the source does not give a figure, it is left out. Free photos from Wikimedia Commons, with author and licence on each entry.')+'</p>';
 setp(h,L('Armas ligeras','Small arms'));
 var q=document.getElementById('gq'), res=document.getElementById('gres'), cats=document.getElementById('gcats');
 function draw(){ var s=norm(q.value); st.q=q.value; if(s.length<2){res.innerHTML='';cats.style.display='';return;} cats.style.display='none';
  var R=A.filter(function(a){return [a.n].concat(a.k||[]).some(function(x){return norm(x).indexOf(s)>=0;});}).sort(sorter('crono'));
  res.innerHTML=R.length?'<div class="list" style="margin-top:10px">'+R.map(function(a){return row(a,'');}).join('')+'</div>':'<p class="empty">'+L('Sin resultados.','No results.')+'</p>'; }
 q.addEventListener('input',draw); draw();
}
function slugT(s){ return 'g_'+s.replace(/-/g,'_'); }
function lista(tid){
 var t=TYM[tid], A=all(), base=t?A.filter(function(a){return a.tipo===tid||(a.alt&&a.alt.indexOf(tid)>=0);}):A;
 var title=t?L(t[1],t[2]):L('Todas las armas','All weapons');
 var h=crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[title]])+'<h1>'+esc(title)+'</h1><p class="sub">'+(t?L(t[3],t[4])+'. ':'')+base.length+' '+L('armas','weapons')+'.</p>';
 var pc={}, mc={}; base.forEach(function(a){ pc[a.pais]=(pc[a.pais]||0)+1; var m=a.mun; if(m) mc[m]=(mc[m]||0)+1; });
 var PS=Object.keys(pc).sort(function(x,y){return pn(x).localeCompare(pn(y));});
 var MS=Object.keys(mc).sort(function(x,y){return mc[y]-mc[x]||x.localeCompare(y);});
 var munEN={}; base.forEach(function(a){ if(a.mun) munEN[a.mun]=a.mun_en||a.mun; });
 if(st.pais&&!pc[st.pais]) st.pais=''; if(st.mun&&!mc[st.mun]) st.mun='';
 h+='<div class="gctl"><input class="inp" id="gq" type="search" placeholder="'+L('Filtrar por nombre','Filter by name')+'" value="'+esc(st.q)+'" autocomplete="off">'+
  '<select class="sel" id="gso" aria-label="'+L('Ordenar','Sort')+'">'+SORTS.map(function(s){return '<option value="'+s[0]+'">'+L(s[1],s[2])+'</option>';}).join('')+'</select>'+
  '<select class="sel" id="gpa" aria-label="'+L('País de origen','Country of origin')+'"><option value="">'+L('Todos los países','All countries')+'</option>'+PS.map(function(k){return '<option value="'+k+'">'+esc(pn(k))+' ('+pc[k]+')</option>';}).join('')+'</select>'+
  '<select class="sel" id="gmu" aria-label="'+L('Calibre','Calibre')+'"><option value="">'+L('Todos los calibres','All calibres')+'</option>'+MS.map(function(m){return '<option value="'+esc(m)+'">'+esc(EN()?munEN[m]:m)+' ('+mc[m]+')</option>';}).join('')+'</select></div>';
 var eras=ERA.filter(function(e){return base.some(function(a){return inEra(a,e[0]);});});
 h+='<div class="gchips" role="group" aria-label="'+L('Época','Era')+'"><button class="chip gera" data-e="" aria-pressed="'+(!st.era)+'">'+L('Todas las épocas','All eras')+'</button>'+eras.map(function(e){return '<button class="chip gera" data-e="'+e[0]+'" aria-pressed="'+(st.era===e[0])+'">'+L(e[1],e[2])+'</button>';}).join('')+'<button class="chip gsv" aria-pressed="'+st.serv+'">'+L('Solo en servicio','In service only')+'</button></div>';
 h+='<p class="note" style="margin:2px 0 0">'+L('Época: cuándo entró en servicio y en qué guerras mundiales se usó; «Actualidad» = sigue en servicio.','Era: when it entered service and which world wars it was used in; “Today” = still in service.')+'</p><div id="gres"></div>';
 setp(h,title);
 var q=document.getElementById('gq'), so=document.getElementById('gso'), pa=document.getElementById('gpa'), mu=document.getElementById('gmu'), res=document.getElementById('gres');
 so.value=st.sort; pa.value=st.pais; mu.value=st.mun;
 function draw(){ var s=norm(st.q);
  var R=base.filter(function(a){return (!st.era||inEra(a,st.era))&&(!st.pais||a.pais===st.pais)&&(!st.mun||a.mun===st.mun)&&(!st.serv||a.serv)&&(!s||[a.n].concat(a.k||[]).some(function(x){return norm(x).indexOf(s)>=0;}));});
  R.sort(sorter(st.sort));
  if(!R.length){res.innerHTML='<p class="empty">'+L('Sin resultados.','No results.')+'</p>';return;}
  var o='';
  if(st.sort==='crono'&&!st.era){ var G=[['ww1_',null]]; var groups=[['xix'],['ww1'],['entre'],['ww2'],['fria'],['actual'],[null]];
   groups.forEach(function(g){ var L2=R.filter(function(a){return (a.era||null)===g[0];}); if(!L2.length) return; o+='<h2>'+(g[0]?L(GH[g[0]][0],GH[g[0]][1]):L('Sin fecha en la fuente','No date in the source'))+' <span class="cnt">· '+L2.length+'</span></h2><div class="list">'+L2.map(function(a){return row(a,st.sort);}).join('')+'</div>'; }); }
  else o='<p class="sub" style="margin:10px 0 4px">'+R.length+' '+L('resultados','results')+'</p><div class="list">'+R.map(function(a){return row(a,st.sort);}).join('')+'</div>';
  res.innerHTML=o; }
 q.addEventListener('input',function(){st.q=q.value;draw();});
 so.addEventListener('change',function(){st.sort=so.value;draw();});
 pa.addEventListener('change',function(){st.pais=pa.value;draw();});
 mu.addEventListener('change',function(){st.mun=mu.value;draw();});
 Array.prototype.forEach.call(document.querySelectorAll('.gera'),function(c){c.addEventListener('click',function(){st.era=c.getAttribute('data-e');Array.prototype.forEach.call(document.querySelectorAll('.gera'),function(x){x.setAttribute('aria-pressed',String(x===c));});draw();});});
 var sv=document.querySelector('.gsv'); sv.addEventListener('click',function(){st.serv=!st.serv; sv.setAttribute('aria-pressed',String(st.serv)); draw();});
 draw();
}
function sp(k,v){return v?'<div class="sp"><span class="k">'+k+'</span><span class="v">'+esc(v)+'</span></div>':'';}
function blk(title,rows){ var r=rows.map(function(x){return sp(x[0],x[1]);}).join(''); return r?'<h2>'+title+'</h2><div class="specs">'+r+'</div>':''; }
function bl(arr){return arr&&arr.length?'<ul class="bul">'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'';}
function ficha(a){
 css(); var F=a.F||{}, t=TYM[a.tipo]||['', 'Armas','Weapons'], tn=L(t[1],t[2]), sl=a.tipo.slice(2).replace(/_/g,'-');
 var h=crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[tn,'#/armas/'+sl],[a.n]]);
 h+='<div class="dwrap"><div>';
 if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+esc(a.img.src)+'" alt="'+esc(a.n)+'"></figure><div class="gcred">'+L('Foto','Photo')+': <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">'+esc((a.img.au?a.img.au+' · ':'')+(EN()?(a.img.lic_en||a.img.lic):a.img.lic)+' · Wikimedia Commons')+'</a></div>';
 else h+='<figure class="dhero" style="margin-bottom:0"><div class="gph" style="height:180px">'+ICO+'</div></figure><div class="gcred">'+L('Sin foto libre en Wikimedia Commons por ahora (silueta genérica, no es el arma).','No free photo on Wikimedia Commons yet (generic silhouette, not the weapon).')+'</div>';
 h+='</div><div><div class="kicker">'+esc(tn)+(a.era&&ERAM[a.era]?' · '+L(ERAM[a.era][0],ERAM[a.era][1]):'')+'</div><h1>'+esc(a.n)+'</h1>';
 var m=EN()?(a.mun_en||a.mun):a.mun;
 h+='<div class="tags"><span class="tag on">'+flag(a.pais)+esc(orgLbl(a))+'</span><span class="tag">'+svc(a)+'</span>'+(m?'<span class="tag">'+esc(m)+'</span>':'')+(a.anio?'<span class="tag">'+a.anio+'</span>':'')+'</div>';
 if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
 var K=[[L('Munición','Cartridge'),m],[L('Cadencia','Rate of fire'),a.cad?nf(a.cad)+L(' disp./min',' rds/min'):first(F.cadencia,30)],[L('Vel. de boca','Muzzle velocity'),a.vb?nf(a.vb)+' m/s':first(F.velocidad_boca,26)],[L('Alcance eficaz','Effective range'),a.alc?nf(a.alc)+' m':first(F.alcance_eficaz,26)],[L('Peso','Weight'),a.peso?nf(a.peso,2)+' kg':first(F.peso,26)],[L('Alimentación','Feed'),first(F.alimentacion,40)]].filter(function(x){return x[1];});
 if(K.length) h+='<div class="gkpis">'+K.map(function(x){return '<div><div class="kv">'+esc(x[1])+'</div><div class="kk">'+x[0]+'</div></div>';}).join('')+'</div>';
 h+='</div></div>';
 h+=blk(L('Disparo y munición','Firing and ammunition'),[[L('Munición','Cartridge'),F.municion],[L('Mecanismo','Action'),F.mecanismo],[L('Cadencia de tiro','Rate of fire'),F.cadencia],[L('Velocidad de boca','Muzzle velocity'),F.velocidad_boca],[L('Alcance eficaz','Effective firing range'),F.alcance_eficaz],[L('Alcance máximo','Maximum firing range'),F.alcance_max],[L('Retroceso','Recoil'),F.retroceso],[L('Alimentación','Feed system'),F.alimentacion]]);
 h+=blk(L('Dimensiones y miras','Dimensions and sights'),[[L('Peso','Weight'),F.peso],[L('Longitud','Length'),F.longitud],[L('Longitud del cañón','Barrel length'),F.canon],[L('Miras','Sights'),F.miras]]);
 h+=blk(L('Historia y producción','History and production'),[[L('Tipo','Type'),F.tipo],[L('Origen','Place of origin'),F.origen],[L('Diseñador','Designer'),F.diseno],[L('Fecha de diseño','Designed'),F.fecha_diseno],[L('Fabricante','Manufacturer'),F.fabricante],[L('Producción','Produced'),F.produccion],[L('Unidades fabricadas','Number built'),F.unidades],[L('Coste unitario','Unit cost'),F.coste],[L('En servicio','In service'),F.servicio],[L('Estado','Status'),F.estado||svc(a)]]);
 var ops=a.ops||{}, cur=[], old=[];
 Object.keys(ops).forEach(function(k){ (ops[k].f?old:cur).push(k); });
 function byN(x,y){return (x==='espana'?-1:y==='espana'?1:0)||pn(x).localeCompare(pn(y));}
 cur.sort(byN); old.sort(byN);
 function ur(k){ var n=ops[k].t||''; return '<a class="row" href="#/fuerzas?a=p:'+k+'">'+flag(k)+'<div class="m"><div class="nm">'+esc(pn(k))+'</div>'+(n?'<div class="ds">'+esc(n)+'</div>':'')+'</div><div class="ch">›</div></a>'; }
 h+='<h2>'+L('Países que la usan','Users')+'</h2>'+(cur.length?'<p class="sub" style="margin:0 0 6px">'+L('Usuarios actuales','Current users')+': '+cur.length+'</p><div class="list gusr">'+cur.map(ur).join('')+'</div>':'<p class="sub">'+L('Ningún usuario actual en la fuente.','No current users in the source.')+'</p>')+
  (old.length?'<details class="gfold"><summary>'+L('Antiguos usuarios','Former users')+' · '+old.length+'</summary><div class="list gusr">'+old.map(ur).join('')+'</div></details>':'');
 h+='<h2>'+L('Conflictos','Conflicts')+'</h2>'+(bl(a.conf)||'<p class="sub">'+L('Sin conflictos en la fuente','No conflicts in the source')+'</p>');
 if(a.vars&&a.vars.length) h+='<h2>'+L('Variantes','Variants')+'</h2>'+bl(a.vars);
 if(a.cur&&a.cur.length) h+='<h2>'+L('Curiosidades','Did you know?')+'</h2>'+bl(a.cur);
 h+='<div class="btns"><a class="btn pri" href="#/armas/'+sl+'">'+L('Más','More')+' '+esc(tn.toLowerCase())+'</a><a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">'+L('Fuente: Wikipedia (inglés)','Source: Wikipedia')+'</a>'+(a.src_es?'<a class="btn" href="'+esc(a.src_es)+'" target="_blank" rel="noopener">Wikipedia '+L('en español','(Spanish)')+'</a>':'')+'</div>';
 h+='<p class="note">'+L('Datos traducidos del artículo de Wikipedia enlazado (ficha técnica y texto). Los países enlazan a su página de fuerzas armadas. Si la fuente no da un dato (por ejemplo, el retroceso), no aparece: nada inventado.','Data from the linked Wikipedia article (infobox and text). Countries link to their armed forces page. If the source does not give a figure (for example recoil), it is left out: nothing invented.')+'</p>';
 setp('<div class="tk">'+h+'</div>',a.n);
}
window.MAT_ARMAS={
 route:function(app,ax){ window.MAT_AX=ax; css(); var p=ax.p; if(p.length<2) return home(); var tid=p[1]==='todas'?'':slugT(p[1]); if(tid&&!TYM[tid]) return ax.notfound(); return lista(tid); },
 ficha:function(a,ax){ window.MAT_AX=ax; return ficha(a); },
 TY:TY
};
})();
