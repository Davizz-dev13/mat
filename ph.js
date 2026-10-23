/* M.A.T — silueta para fichas sin foto libre (icono dibujado, no es una foto) */
(function(){
var P={
tank:'<path d="M5 25h50l-3 4H8z"/><path d="M7 18h45l4 6H4z"/><path d="M19 11h15l4 6H16z"/><path d="M37 13h23v2H37z"/>',
apc:'<path d="M5 12h39l11 6v6H5z"/><path d="M21 7h10v5H21z"/><path d="M31 8.5h13v1.6H31z"/><circle cx="12" cy="25" r="4"/><circle cx="22" cy="25" r="4"/><circle cx="38" cy="25" r="4"/><circle cx="48" cy="25" r="4"/>',
truck:'<path d="M4 7h37v17H4z"/><path d="M43 11h10l5 7v6H43z"/><circle cx="12" cy="26" r="4"/><circle cx="24" cy="26" r="4"/><circle cx="50" cy="26" r="4"/>',
plane:'<path d="M5 17l9-3h36q8 0 10 3-2 2-10 2H14z"/><path d="M26 17h14l-10 11h-6z"/><path d="M8 15L4 6h5l7 8z"/><path d="M6 17l-4 3h8z"/>',
heli:'<path d="M20 15q0-5 8-5h12q8 0 8 8 0 4-8 4H26q-6 0-6-7z"/><path d="M4 13h18v3H4z"/><path d="M3 9h2v10H3z"/><path d="M33 6h2v4h-2z"/><path d="M9 4.5h50V6H9z"/><path d="M24 26h22v1.6H24z"/><path d="M28 22h1.6v4H28zM40 22h1.6v4H40z"/>',
ship:'<path d="M2 20h60l-6 7H8z"/><path d="M20 12h20v8H20z"/><path d="M29 4h2v8h-2z"/><path d="M14 15h6v5h-6z"/><path d="M42 16h4v4h-4z"/><path d="M45 17h10v1.5H45z"/>',
sub:'<path d="M4 18q0-5 10-5h38q8 0 8 5t-8 5H14Q4 23 4 18z"/><path d="M24 7h10l2 6H23z"/><path d="M58 12h2v12h-2z"/>',
missile:'<path d="M8 13.5h38q10 0 14 2.5-4 2.5-14 2.5H8z"/><path d="M8 13.5L4 8h6l4 5.5zM8 18.5L4 24h6l4-5.5z"/><path d="M28 13.5l3-3.5h3l-1 3.5zM28 18.5l3 3.5h3l-1-3.5z"/>',
rocket:'<path d="M29.5 5q2.5-4 5 0v19h-5z"/><path d="M29.5 17L25 27h4.5zM34.5 17L39 27h-4.5z"/><path d="M30.5 25h3l-1.5 4z"/>',
sat:'<path d="M28 12h8v8h-8z"/><path d="M6 13h18v6H6zM40 13h18v6H40z"/><path d="M24 15.3h4v1.4h-4zM36 15.3h4v1.4h-4z"/><path d="M29 11q3-6 6 0z"/>',
astro:'<circle cx="32" cy="12" r="8"/><path d="M18 30q0-10 14-10t14 10z"/>',
emb:'<path d="M32 3l14 4v9q0 9-14 13-14-4-14-13V7z"/>',
moto:'<circle cx="13" cy="23" r="6"/><circle cx="51" cy="23" r="6"/><path d="M12 22l9-8h15l5 3 9 5-2 2-8-3H27l-10 8z"/><path d="M35 8h7l4 6h-9z"/><path d="M22 12h10v3H22z"/>'
};
function kind(a){
  var c=(a&&a.cat)||'', t=(a&&a.tipo)||'';
  if(c==='tanques')return 'tank';
  if(c==='blindados')return /b_mlr|l_san_amb/.test(t)?'truck':(/b_art|b_aa/.test(t)?'tank':'apc');
  if(c==='logistica')return /buque/.test(t)?'ship':(/heli/.test(t)?'heli':(/avion/.test(t)?'plane':'truck'));
  if(c==='helicopteros')return 'heli';
  if(c==='aviones')return 'plane';
  if(c==='buques')return 'ship';
  if(c==='submarinos')return 'sub';
  if(c==='armamento')return 'missile';
  if(c==='espacio')return /e_sat|e_nave/.test(t)?'sat':(t==='e_lanz'?'rocket':(t==='e_astro'?'astro':'emb'));
  if(a&&a._k)return a._k;
  return 'emb';
}
function EN(){try{return document.documentElement.lang==='en'||localStorage.getItem('mat_lang')==='en';}catch(e){return false;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function svg(k){return '<svg class="phsv" viewBox="0 0 64 32" aria-hidden="true">'+(P[k]||P.emb)+'</svg>';}
/* small thumbnail for lists */
window.MAT_PH=function(a,k){return '<div class="nofoto ph">'+svg(k||kind(a))+'<span>'+(EN()?'No free photo':'Sin foto libre')+'</span></div>';};
/* big hero + caption with optional link to the real photo at an official source */
window.MAT_PHBIG=function(a,k){
  var en=EN(), r=a&&a.pref;
  var h='<figure class="dhero nofig"><div class="nofoto big ph">'+svg(k||kind(a))+'<span>'+(en?'No free photo · icon':'Sin foto libre · icono')+'</span></div></figure>';
  h+='<div class="credit">'+(en?'Drawn icon of the category: no freely licensed photo of this system was found.':'Icono dibujado de la categoría: no hay una foto con licencia libre de este sistema.');
  if(r&&r.u) h+=' <a class="phref" href="'+esc(r.u)+'" target="_blank" rel="noopener">'+(en?'See photo at the source':'Ver foto en la fuente')+(r.n?' ('+esc(r.n)+')':'')+' ›</a>';
  return h+'</div>';
};
/* photo credit line: Commons by default, other free source when img.cs is set */
window.MAT_CREDIT=function(img){
  var en=EN(), cs=img&&(en?(img.cs_en||img.cs):img.cs);
  return '<a href="'+esc(img.credit)+'" target="_blank" rel="noopener">'+(cs?esc(cs):(en?'Wikimedia Commons / Wikipedia — author and licence':'Wikimedia Commons / Wikipedia — autor y licencia'))+'</a>';
};
})();
