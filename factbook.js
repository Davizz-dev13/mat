(function(){
"use strict";
// ============ M.A.T · Datos complementarios (CIA World Factbook, edición 2025, vía worldfactbookarchive.org) ============
// Dominio público (gobierno de EE. UU.). Bloque informativo en la página de país; no sustituye al gasto en euros (gasto.js) ni al inventario.
var D=null, DP=null;
function EN(){return window.MAT_LANG==='en';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function css(){ if(document.getElementById('fb-css')) return; var s=document.createElement('style'); s.id='fb-css';
 s.textContent='.fbbox{border:1px solid var(--line);border-radius:var(--r);padding:12px;margin:14px 0;background:var(--s1)}.fbbox h3{margin:0 0 8px}'+
 '.fbgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fbc{background:var(--s2);border-radius:4px;padding:8px 9px;min-width:0}'+
 '.fbc span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}.fbc b{display:block;font-size:16px;font-variant-numeric:tabular-nums;color:var(--tx);overflow-wrap:anywhere}'+
 '.fbc i{display:block;font-style:normal;font-size:11px;color:var(--mu)}.fbw{grid-column:1/-1}.fbw b{font-size:14px;font-weight:500;line-height:1.4}'+
 '.fbsrc{font-size:12px;color:var(--mu);margin:8px 0 0;line-height:1.45}.fbsrc a{color:var(--ac2)}';
 document.head.appendChild(s); }
function load(){ if(DP) return DP; DP=fetch('factbook.json?v='+(document.querySelector('script[data-v]')||{getAttribute:function(){return '';}}).getAttribute('data-v')).then(function(r){if(!r.ok) throw new Error(r.status); return r.json();}).then(function(d){D=d; fill(); return d;}); DP.catch(function(){}); return DP; }
function nf(v,dec){ if(v==null||isNaN(v)) return '—'; var s=Number(v).toFixed(dec||0), p=s.split('.'), i=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,EN()?',':'.'); return p.length>1?i+(EN()?'.':',')+p[1]:i; }
function nd(v){ return nf(v, Math.round(v)===v?0:1); }
function big(v){ var e=EN(); if(v>=1e9) return nf(v/1e9,2)+(e?' billion':' mil millones'); if(v>=1e6) return nf(v/1e6,1)+(e?' million':' millones'); return nf(v); }
function cell(lab,val,sub,wide){ return '<div class="fbc'+(wide?' fbw':'')+'"><span>'+lab+'</span><b>'+val+'</b>'+(sub?'<i>'+sub+'</i>':'')+'</div>'; }
function html(k){ var c=D&&D.c[k]; if(!c) return ''; var e=EN(), h='', L=function(es,en){return e?en:es;};
  function y(a,est){ return a&&a[1]?(est?L('est. ','est. '):'')+a[1]:''; }
  h+='<div class="fbgrid">';
  if(c.pob) h+=cell(L('Población','Population'),big(c.pob[0]),y(c.pob,1));
  if(c.area!=null) h+=cell(L('Superficie','Area'),nf(c.area)+' km²','');
  if(c.costa!=null) h+=cell(L('Costa','Coastline'),nd(c.costa)+' km','');
  if(c.front) h+=cell(L('Fronteras terrestres','Land borders'),nd(c.front[0])+' km',c.front[1]?(c.front[1]+' '+L(c.front[1]===1?'país':'países',c.front[1]===1?'country':'countries')):'');
  if(c.edad) h+=cell(L('Edad mediana','Median age'),nd(c.edad[0])+' '+L('años','years'),y(c.edad,1));
  if(c.gpib) h+=cell(L('Gasto militar (% del PIB)','Military spending (% of GDP)'),nd(c.gpib[0])+' %',y(c.gpib,1)+(c.gpib_note?' · '+esc(e?c.gpib_note[1]:c.gpib_note[0]):''),!!c.gpib_note);
  else if(c.gpib_txt) h+=cell(L('Gasto militar (% del PIB)','Military spending (% of GDP)'),esc(e?c.gpib_txt[1]:c.gpib_txt[0]),'',true);
  if(c.pers) h+=cell(L('Efectivos','Personnel'),esc(e?c.pers[1]:c.pers[0]),c.pers[2]||'',true);
  if(c.serv) h+=cell(L('Servicio militar','Military service'),esc(e?c.serv[1]:c.serv[0]),c.serv[2]||'',true);
  if(c.aerop) h+=cell(L('Aeropuertos','Airports'),nf(c.aerop[0]),y(c.aerop)+(c.helip?' · '+nf(c.helip[0])+' '+L('helipuertos','heliports'):''));
  if(c.puertos) h+=cell(L('Puertos','Ports'),nf(c.puertos[0]),y(c.puertos));
  if(c.mm) h+=cell(L('Marina mercante','Merchant marine'),nf(c.mm[0])+' '+L('buques','ships'),y(c.mm));
  if(c.tren) h+=cell(L('Ferrocarril','Railways'),nd(Math.round(c.tren[0]))+' km',y(c.tren));
  h+='</div>';
  var u='https://worldfactbookarchive.org/archive/'+D.ed+'/'+encodeURIComponent(c.iso);
  h+='<p class="fbsrc">'+L('Fuente: CIA World Factbook (vía <a href="'+u+'" target="_blank" rel="noopener">worldfactbookarchive.org</a>), edición '+D.ed+'. Dominio público. Cifras tal como las publica el Factbook (estimaciones con su año); el gasto militar en euros de arriba es el dato principal de M.A.T.','Source: CIA World Factbook (via <a href="'+u+'" target="_blank" rel="noopener">worldfactbookarchive.org</a>), '+D.ed+' edition. Public domain. Figures as published by the Factbook (estimates with their year); the euro military spending above is M.A.T\'s main figure.')+'</p>';
  return h; }
function fill(){ if(!D) return; Array.prototype.forEach.call(document.querySelectorAll('.fbbox[data-k]:not([data-ok])'),function(b){ var k=b.getAttribute('data-k'); var x=html(k); if(!x){ b.remove(); return; } b.querySelector('.fbin').innerHTML=x; b.setAttribute('data-ok','1'); }); }
window.MAT_FB={
  has:function(k){ return !D||!!D.c[k]; },
  block:function(k){ css(); if(D&&!D.c[k]) return ''; var t=EN()?'Additional data':'Datos complementarios';
    var h='<div class="fbbox" data-noi18n data-k="'+esc(k)+'"'+(D?' data-ok="1"':'')+'><h3>'+t+'</h3><div class="fbin">'+(D?html(k):'<p class="fbsrc">'+(EN()?'Loading…':'Cargando…')+'</p>')+'</div></div>';
    if(!D){ load(); setTimeout(fill,0); } return h; }
};
})();
