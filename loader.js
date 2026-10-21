(function(){
var V=document.currentScript.getAttribute('data-v');
var F=["data.json.gz", "tanques.json.gz", "blindados.json.gz", "buques.json.gz", "submarinos.json.gz", "logistica.json.gz", "armamento.json.gz", "espacio.json.gz"];
var app=document.getElementById('app');
app.innerHTML='<p class="sub" style="padding:24px 0">Cargando archivo…</p>';
function go(D){window.MAT_DATA=D;['ph.js','duelo.js','fuerzas.js','mapa.js','noticias.js','espacio.js','onu.js','exterior.js','fyse.js','gasto.js','guerras.js','app.js'].forEach(function(f){var s=document.createElement('script');s.src=f+'?v='+V;s.async=false;document.body.appendChild(s);});}
function fail(){app.innerHTML='<p class="sub" style="padding:24px 0">No se pudo cargar M.A.T. Comprueba la conexión o actualiza Safari/Chrome.</p>';}
if(!('DecompressionStream' in window)){fail();return;}
function get(f){return fetch(f+'?v='+V).then(function(r){if(!r.ok) throw new Error(r.status); return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();}).catch(function(){return fetch(f+'?v='+V).then(function(r){return r.json();});});}
function ov(f){ if(window.MAT_LANG!=='en') return Promise.resolve(null); return Promise.resolve(window.MAT_I18N).then(function(){ return (window.MAT_EN_OV||[]).indexOf('en_'+f)>=0?get('en_'+f).catch(function(){return null;}):null; }); }
function merge(t,o){ for(var k in o){ var v=o[k]; if(v&&typeof v==='object'&&!Array.isArray(v)&&t[k]&&typeof t[k]==='object'&&!Array.isArray(t[k])) merge(t[k],v); else t[k]=v; } }
window.MAT_MERGE=merge;
window.MAT_LAZY=function(cat){return Promise.all([get(cat+'_d.json.gz'),ov(cat+'_d.json.gz')]).then(function(z){ var d=z[0],o=z[1]; if(o) for(var id in o){ if(d[id]) merge(d[id],o[id]); } return d; });};
window.MAT_GET=get;
Promise.all([Promise.all(F.map(get)),Promise.all(F.map(ov)),window.MAT_I18N||null]).then(function(Z){var L=Z[0],O=Z[1]; L.forEach(function(x,i){ var o=O[i]; if(o&&x.items) x.items.forEach(function(it){ if(o[it.id]) merge(it,o[it.id]); }); }); var D=L[0]; for(var i=1;i<L.length;i++){D.items=D.items.concat(L[i].items); if(L[i].alias){D.alias=D.alias||{}; for(var k in L[i].alias) D.alias[k]=L[i].alias[k];}} go(D);}).catch(fail);
})();
