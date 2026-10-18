
(function(){
"use strict";
// M.A.T · idioma (ES/EN). Español por defecto; ?lang=en o el selector lo cambian y se recuerda.
var m=(location.search+location.hash).match(/[?&]lang=(en|es)\b/), L=m?m[1]:null;
try{ if(L) localStorage.setItem('mat_lang',L); else L=localStorage.getItem('mat_lang'); }catch(e){}
L=L==='en'?'en':'es'; window.MAT_LANG=L; document.documentElement.lang=L;
window.MAT_SETLANG=function(l){ try{localStorage.setItem('mat_lang',l);}catch(e){} var u=location.href.replace(/([?&])lang=(en|es)&?/,'$1').replace(/[?&]$/,''); location.replace(u); setTimeout(function(){location.reload();},50); };
var E=null, RX=null;
window.MAT_T=function(s){ if(!E||s==null) return s; var t=String(s).trim(); return E[t]||s; };
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function tr(text){ if(!E) return text; var t=text.trim(); if(!t) return text; if(E[t]) return text.replace(t,E[t]);
  if(t.length>160||!RX) return text;
  var out=text.replace(RX,function(w,off,all){ var a=all.charAt(off-1), b=all.charAt(off+w.length); if(/[A-Za-zÀ-ÿ]/.test(a)||/[A-Za-zÀ-ÿ]/.test(b)) return w; return E[w]||w; });
  if(out===text) return text; var sw=(out.match(/(^|[^A-Za-zÀ-ÿ])(de|la|el|los|las|del|y|con|que|en|por|para|su|sus|una|un|se|al|es|más)(?=[^A-Za-zÀ-ÿ]|$)/gi)||[]).length; return sw>=2?text:out; }
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,CODE:1}, ATTR=['placeholder','aria-label','title'];
var done=new WeakMap();
function walk(root){ if(!E) return; if(root.nodeType===3){ node(root); return; } if(root.nodeType!==1||SKIP[root.tagName]||root.closest&&root.closest('[data-noi18n]')) return;
  ATTR.forEach(function(a){ var v=root.getAttribute&&root.getAttribute(a); if(v){ var n=tr(v); if(n!==v) root.setAttribute(a,n);} });
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null), n;
  while((n=w.nextNode())){ if(n.nodeType===3) node(n); else { if(SKIP[n.tagName]||n.hasAttribute('data-noi18n')) continue; for(var i=0;i<ATTR.length;i++){ var v=n.getAttribute(ATTR[i]); if(v){ var nv=tr(v); if(nv!==v) n.setAttribute(ATTR[i],nv);} } } } }
function node(n){ var v=n.nodeValue; if(done.get(n)===v) return; var p=n.parentNode; if(p&&(SKIP[p.nodeName]||(p.closest&&p.closest('[data-noi18n]')))) return; var nv=tr(v); if(nv!==v) n.nodeValue=nv; done.set(n,nv); }
function switcher(){ var t=document.querySelector('.topnav'); if(t&&!t.querySelector('.langsw')){ var b=document.createElement('button'); b.className='langsw'; b.type='button'; b.setAttribute('data-noi18n',''); b.textContent=L==='en'?'ES':'EN'; b.setAttribute('aria-label',L==='en'?'Ver en español':'View in English'); b.onclick=function(){window.MAT_SETLANG(L==='en'?'es':'en');}; t.appendChild(b);} 
  var c=document.querySelector('.cover'); if(c&&!c.querySelector('.langsw')){ var b2=document.createElement('button'); b2.className='langsw lscov'; b2.type='button'; b2.setAttribute('data-noi18n',''); b2.textContent=L==='en'?'Español':'English'; b2.onclick=function(e){e.stopPropagation(); window.MAT_SETLANG(L==='en'?'es':'en');}; c.appendChild(b2);} }
var mo=new MutationObserver(function(ms){ switcher(); if(!E) return; for(var i=0;i<ms.length;i++){ var r=ms[i]; if(r.type==='characterData') node(r.target); else if(r.type==='attributes') walk(r.target); else for(var j=0;j<r.addedNodes.length;j++) walk(r.addedNodes[j]); } });
function start(){ mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR}); switcher(); if(E) walk(document.body); }
if(L==='en'){
  window.MAT_I18N=fetch('i18n_en.json?v='+(document.currentScript&&document.currentScript.getAttribute('data-v')||'1')).then(function(r){return r.json();}).then(function(d){ window.MAT_EN_OV=d.__ov||[]; delete d.__ov; E=d; var ks=Object.keys(d).filter(function(k){return k.length>=4&&/[A-Za-zÀ-ÿ]{3}/.test(k);}).sort(function(a,b){return b.length-a.length;}); RX=new RegExp(ks.map(esc).join('|'),'g'); document.title='M.A.T'; if(document.body) walk(document.body); }).catch(function(){});
} else window.MAT_I18N=Promise.resolve();
if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
})();
