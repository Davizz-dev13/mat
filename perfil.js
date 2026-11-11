/* M.A.T · «Tu soldado» (Jose, 11 nov. 2026): un círculo junto a «Medallas», como el avatar de una cuenta.
   - Si ya has sacado la carta de tu soldado: el círculo muestra su cara y al tocarlo se abre su carta (guardada en este dispositivo, sin 3D en la portada).
   - Si eres nuevo: silueta con «+» y 3 pasos (arma → soldado → carta).
   - «Mis soldados»: hasta 5 soldados en este dispositivo (localStorage «mat_sd_slots»); #/soldado siempre edita el activo («mat_soldado»).
   - «Código de soldado»: rol, equipo, ghillie, apodo, empleo y 3 medallas empaquetados en bytes + suma de control, en base32 (MAT-XXXX-XXXX-…).
     No hay servidor: el código lleva sus propios datos y no se puede verificar (es un juego). */
(function(){
"use strict";
if(window.MAT_SDP) return;
var SK='mat_sd_slots', AK='mat_sd_act', KEY='mat_soldado', NKEY='mat_sd_nick', MAX=5;
function EN(){ return window.MAT_LANG==='en'; }
function L(es,en){ return EN()?en:es; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function jget(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function jset(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function slots(){ var s=jget(SK,[]); return Array.isArray(s)?s.filter(function(x){ return x&&x.id; }).slice(0,MAX):[]; }
function hasSoldier(st){ return !!(st&&(st.role||(st.q&&Object.keys(st.q).some(function(k){ return st.q[k]>0; }))||st.arma)); }
/* el soldado que se edita en #/soldado vive en «mat_soldado»; aquí se copia a su hueco */
function sync(){ var S=slots(), a=localStorage.getItem(AK), cur=jget(KEY,null), nick=''; try{ nick=localStorage.getItem(NKEY)||''; }catch(e){}
  var s=S.filter(function(x){ return x.id===a; })[0];
  if(!s){ if(!hasSoldier(cur)) return S; if(S.length>=MAX){ s=S[0]; } else { s={id:'s'+Date.now().toString(36),t:Date.now()}; S.push(s); } try{ localStorage.setItem(AK,s.id); }catch(e){} }
  if(cur) s.st=cur; s.nick=nick; if(!jset(SK,S)) trim(S); return S; }
function trim(S){ /* sin sitio: se quitan las cartas grandes de los soldados no activos (la cara se queda) */ var a=localStorage.getItem(AK); S.forEach(function(x){ if(x.id!==a) delete x.img; }); jset(SK,S); }
function active(){ var a=localStorage.getItem(AK); return slots().filter(function(x){ return x.id===a; })[0]||null; }
function activate(id){ var S=sync(), s=S.filter(function(x){ return x.id===id; })[0]; if(!s) return;
  try{ localStorage.setItem(AK,id); if(s.st) localStorage.setItem(KEY,JSON.stringify(s.st)); else localStorage.removeItem(KEY); if(s.nick) localStorage.setItem(NKEY,s.nick); else localStorage.removeItem(NKEY); }catch(e){} }
function fresh(){ var S=sync(); if(S.length>=MAX) return false; var s={id:'s'+Date.now().toString(36),t:Date.now()}; S.push(s); jset(SK,S);
  try{ localStorage.setItem(AK,s.id); localStorage.removeItem(KEY); localStorage.removeItem(NKEY); }catch(e){} return true; }
function drop(id){ var S=slots().filter(function(x){ return x.id!==id; }); jset(SK,S); if(localStorage.getItem(AK)===id){ if(S[0]) activate(S[0].id); else try{ localStorage.removeItem(AK); localStorage.removeItem(KEY); localStorage.removeItem(NKEY); }catch(e){} } }
function go(h){ if(location.hash===h) h=h+(h.indexOf('?')<0?'?':'&')+'n='+Date.now().toString(36); location.hash=h; }

/* ---------- código de soldado ---------- */
var B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function b32e(b){ var o='', v=0, n=0; for(var i=0;i<b.length;i++){ v=(v<<8)|b[i]; n+=8; while(n>=5){ o+=B32[(v>>>(n-5))&31]; n-=5; } v&=255; } if(n>0) o+=B32[(v<<(5-n))&31]; return o; }
function b32d(s){ var o=[], v=0, n=0; for(var i=0;i<s.length;i++){ var k=B32.indexOf(s[i]); if(k<0) return null; v=(v<<5)|k; n+=5; if(n>=8){ o.push((v>>>(n-8))&255); n-=8; } v&=255; } return o; }
function norm(s){ s=String(s||'').toUpperCase().replace(/^.*[?&]VS=/,'').replace(/[&#].*$/,'').replace(/O/g,'0').replace(/[IL]/g,'1').replace(/U/g,'V'); return s.replace(/^MAT/,'').replace(/[^0-9A-Z]/g,''); }
function sum(b){ var h=0x811c9dc5; for(var i=0;i<b.length;i++){ h^=b[i]; h=Math.imul(h,16777619)>>>0; } return [h>>>8&255,h&255]; }
function u8(s){ return Array.prototype.slice.call(new TextEncoder().encode(String(s||''))).slice(0,60); }
function pstr(o,s){ var b=u8(s); o.push(b.length); for(var i=0;i<b.length;i++) o.push(b[i]); }
function group(c){ return 'MAT-'+c.match(/.{1,4}/g).join('-'); }
function roleList(X){ var r=[null]; (X.D.roles||[]).forEach(function(x){ r.push(x.id); }); if(r.indexOf('tirador')<0) r.push('tirador'); return r; }
var GH=['bosque','montana','nieve','desierto'];
var BASE={h:1,kg:1,role:1,lvl:1,q:1,arma:1,camo:1,v:1,terr:1,g:1,gh:1};
function sameArma(a,b){ if(!a&&!b) return true; if(!a||!b) return false; return a.id===b.id&&(a.v||0)===(b.v||0)&&(a.camo||'orig')===(b.camo||'orig')&&!!a.ca===!!b.ca&&JSON.stringify(sortO(a.on||{}))===JSON.stringify(sortO(b.on||{})); }
function sortO(o){ var r={}; Object.keys(o).sort().forEach(function(k){ if(o[k]) r[k]=o[k]; }); return r; }
function defOf(X,role,lvl){ var R=role?X.RL(role):null; return {q:R&&R.sel[lvl]?R.sel[lvl]:(R&&R.sel[0])||{},arma:R?Object.assign({v:0,camo:'orig',ca:false},R.arma):null}; }
function encode(X,d){ var st=X.st(), RS=roleList(X), ri=Math.max(0,RS.indexOf(st.role||null)), lvl=(st.lvl|0)&3, df=defOf(X,st.role,lvl), md=(d&&d.med)||{}, o=[1];
  o.push((ri<<2)|lvl); var gi=GH.indexOf(st.role==='tirador'?(st.gh||''):''); gi=gi<0?0:gi+1;
  var dq=[]; X.D.order.forEach(function(id,i){ var a=+(st.q&&st.q[id])||0, b=+(df.q[id])||0; if(a!==b) dq.push([i,Math.min(255,a)]); });
  var wa=!sameArma(st.arma,df.arma), ex=(+st.v||4)!==4||(+st.terr||0)!==0||(+st.g||0)!==0, look=Object.keys(st).filter(function(k){ return !BASE[k]&&typeof st[k]==='string'&&st[k].length<20; }).sort().map(function(k){ return k+':'+st[k]; }).join(',');
  o.push(gi|(wa?8:0)|(ex?16:0)|(look?32:0)|(dq.length?64:0));
  o.push(Math.max(0,Math.min(255,Math.round(+st.kg||0)))); o.push((md.rank|0)&255); o.push(Math.min(255,md.count|0));
  var top=(md.top||[]).map(function(m){ return window.MAT_MED&&MAT_MED.medIdx?MAT_MED.medIdx(m.id):-1; }).filter(function(i){ return i>=0; }).slice(0,3); o.push(top.length); top.forEach(function(i){ o.push(i>>8&255,i&255); });
  if(dq.length){ o.push(dq.length); dq.forEach(function(p){ o.push(p[0],p[1]); }); }
  if(wa){ var A=st.arma; if(!A) o.push(0); else { pstr(o,A.id); o.push((A.v|0)&127|(A.ca?128:0)); pstr(o,A.camo&&A.camo!=='orig'?A.camo:''); var on=sortO(A.on||{}), ks=Object.keys(on); o.push(ks.length); ks.forEach(function(k){ pstr(o,k); pstr(o,on[k]); }); } }
  if(ex){ o.push(Math.round((+st.v||0)*10)&255, (+st.terr|0)&255, ((Math.round(+st.g||0))+128)&255); }
  if(look) pstr(o,look);
  pstr(o,(d&&d.nick)||'');
  var c=sum(o); return group(b32e(o.concat(c))); }
function decode(X,code){ var b=b32d(norm(code)); if(!b||b.length<9) return {err:'bad'}; var c=sum(b.slice(0,-2)); if(c[0]!==b[b.length-2]||c[1]!==b[b.length-1]) return {err:'sum'}; b=b.slice(0,-2); var p=0;
  function rd(){ if(p>=b.length) throw 0; return b[p++]; } function rs(){ var n=rd(), a=[]; for(var i=0;i<n;i++) a.push(rd()); return new TextDecoder().decode(new Uint8Array(a)); }
  try{ if(rd()!==1) return {err:'ver'}; var RS=roleList(X), x=rd(), role=RS[x>>2]||null, lvl=x&3, f=rd(), kg=rd(), rank=rd(), count=rd(), nt=rd(), top=[];
    for(var i=0;i<nt;i++){ var mi=(rd()<<8)|rd(); var id=window.MAT_MED&&MAT_MED.medAt?MAT_MED.medAt(mi):null; if(id) top.push(id); }
    var df=defOf(X,role,lvl), q=Object.assign({},df.q), arma=df.arma?JSON.parse(JSON.stringify(df.arma)):null;
    if(f&64){ var n=rd(); for(var j=0;j<n;j++){ var ii=rd(), qq=rd(), id2=X.D.order[ii]; if(!id2) continue; if(qq) q[id2]=qq; else delete q[id2]; } }
    if(f&8){ var wid=rs(); if(!wid) arma=null; else { var vv=rd(), cam=rs(), no=rd(), on={}; for(var k=0;k<no;k++){ var sk=rs(); on[sk]=rs(); } arma={id:wid,v:vv&127,ca:!!(vv&128),camo:cam||'orig',on:on}; } }
    var st={role:role,lvl:lvl,q:q,arma:arma,kg:kg||80,h:175,v:4,terr:0,g:0,camo:'od'}; if((f&7)&&role==='tirador') st.gh=GH[(f&7)-1]; else if(role==='tirador') st.gh='';
    if(f&16){ st.v=rd()/10; st.terr=rd(); st.g=rd()-128; }
    if(f&32){ rs().split(',').forEach(function(kv){ var i=kv.indexOf(':'); if(i>0) st[kv.slice(0,i)]=kv.slice(i+1); }); }
    var nick=rs().slice(0,20); return {st:st,nick:nick,rank:rank,count:count,top:top}; }catch(e){ return {err:'short'}; } }

/* ---------- la carta guardada (al pulsar «Compartir» en #/soldado) ---------- */
function toJpeg(blob,w,h,crop){ return new Promise(function(res,rej){ var u=URL.createObjectURL(blob), im=new Image(); im.onload=function(){ try{ var c=document.createElement('canvas'); c.width=w; c.height=h; var x=c.getContext('2d');
  if(crop){ x.fillStyle='#1b2016'; x.fillRect(0,0,w,h); x.drawImage(im,crop[0],crop[1],crop[2],crop[3],0,0,w,h); } else x.drawImage(im,0,0,w,h); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg',crop?0.86:0.8)); }catch(e){ rej(e); } }; im.onerror=function(){ URL.revokeObjectURL(u); rej(new Error('img')); }; im.src=u; }); }
function card(blob,d,X){ var S=sync(), a=localStorage.getItem(AK), s=S.filter(function(x){ return x.id===a; })[0]; if(!s||!blob) return;
  /* cara: la parte alta del panel de la foto (x 40-510, y 160-840 en la carta de 1080×1350) */
  Promise.all([toJpeg(blob,640,800),toJpeg(blob,144,144,[198,220,150,150])]).then(function(r){ var S2=slots(), t=S2.filter(function(x){ return x.id===a; })[0]; if(!t) return;
    t.img=r[0]; t.av=r[1]; t.code=d&&d.code||''; t.role=d&&d.role||''; t.rank=d&&d.med?d.med.rank|0:0; t.medals=d&&d.med?d.med.count|0:0; t.tot=d?d.tot:null; t.pct=d?d.pct:null; t.ct=Date.now(); t.nick=d&&d.nick||''; t.st=jget(KEY,t.st);
    if(!jset(SK,S2)){ trim(S2); if(!jset(SK,S2)){ delete t.img; jset(SK,S2); } } paint(); }).catch(function(){}); }
function codeRow(code){ var u=location.origin+location.pathname+'#/soldado?vs='+code.replace(/-/g,'');
  return '<div class="sdp-code"><span>'+L('Tu código de soldado','Your soldier code')+'</span><b>'+esc(code)+'</b><div><button type="button" class="sd-btn sec" data-sdpcopy="'+esc(code)+'">'+L('Copiar código','Copy code')+'</button><a class="sd-btn sec" href="https://wa.me/?text='+encodeURIComponent(L('¿Quién tiene mejor soldado? Compara el tuyo con el mío en M.A.T: ','Who has the better soldier? Compare yours with mine on M.A.T: ')+u)+'" target="_blank" rel="noopener">'+L('Enviar mi código','Send my code')+'</a><a class="sd-btn sec" href="#/soldado?vs=">'+L('Comparar con un amigo','Compare with a friend')+'</a></div></div>'; }

/* ---------- el círculo ---------- */
var SIL='<svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#1d2218"/><path d="M9.3 13.2c0-4.6 3-7.4 6.7-7.4s6.7 2.8 6.7 7.4l-1.2.6H10.5z" fill="#5d6648"/><rect x="9" y="12.6" width="14" height="1.6" rx=".8" fill="#46503a"/><circle cx="16" cy="16.6" r="3.9" fill="#8f9a6a"/><path d="M6.4 32c.6-6.4 4.4-9.6 9.6-9.6s9 3.2 9.6 9.6z" fill="#8f9a6a"/></svg>';
var AV=null;
function css(){ if(document.getElementById('sdpcss')) return; var s=document.createElement('style'); s.id='sdpcss'; s.textContent=
 '.sdav{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:32px;height:32px;margin:0 2px 0 4px;padding:0;border:0;border-radius:50%;background:none;cursor:pointer;vertical-align:middle;-webkit-tap-highlight-color:transparent}'+
 '.sdav>i{display:block;width:30px;height:30px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1.5px #5d6648;transition:box-shadow .3s}.sdav:hover>i,.sdav:focus-visible>i{box-shadow:0 0 0 2px var(--lime,#c8f03c)}.sdav img{display:block;width:100%;height:100%;object-fit:cover}'+
 '.sdav.has>i{box-shadow:0 0 0 1.5px var(--lime,#c8f03c)}.sdav b{position:absolute;right:-2px;bottom:-2px;width:14px;height:14px;border-radius:50%;background:var(--lime,#c8f03c);color:#0b0c0a;font:800 12px/14px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px #0b0c0a}'+
 /* móvil: el círculo cabe en la cabecera apretando un poco las letras (sin quitar nada) */ '@media (max-width:460px){.sdav{width:27px;height:27px;margin:0}.sdav>i{width:25px;height:25px}.sdav b{width:12px;height:12px;font-size:10.5px;line-height:12px;right:-1px;bottom:-1px}header.top .topnav .ddb{letter-spacing:0;padding:0 2px}header.top .topnav > a{min-width:26px;padding:0 1px}header.top .topnav .langsw{min-width:27px;padding:0 2px}}'+
 '@media (max-width:389px){header.top .topnav .ddb{padding:0 1px}header.top .topnav .ddb.mmbtn{padding:0 1px}header.top .topnav > a{min-width:23px}header.top .topnav .langsw{min-width:24px;padding:0 1px}.sdav{width:25px;height:25px}.sdav>i{width:23px;height:23px}}'+
 '@media (max-width:369px){header.top .topnav > a{min-width:21px;padding:0}header.top .topnav .langsw{min-width:22px}.sdav{width:23px;height:23px}.sdav>i{width:21px;height:21px}.sdav b{width:10px;height:10px;font-size:9px;line-height:10px}}'+
 '.sdpov{position:fixed;inset:0;z-index:2147483000;background:rgba(5,6,4,.72);display:flex;align-items:flex-start;justify-content:center;padding:64px 12px 24px;overflow-y:auto;opacity:0;transition:opacity .25s}.sdpov.in{opacity:1}html.sdplock{overflow:hidden}'+
 '.sdpp{position:relative;width:100%;max-width:440px;background:linear-gradient(165deg,#1d2018 0%,#14160f 60%,#0f110c 100%);color:var(--tx,#efeee6);clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%);padding:18px 16px 16px;transform:translateY(10px);transition:transform .35s var(--ease,cubic-bezier(.65,.05,0,1))}.sdpov.in .sdpp{transform:none}'+
 '.sdpp.wide{max-width:560px}.sdpp h2{margin:0 34px 4px 0;font-size:20px;letter-spacing:.01em}.sdpp .sdpk{display:block;font:600 10.5px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--lime,#c8f03c);margin-bottom:7px}.sdpp p{margin:4px 0 12px;color:var(--mu,#a3a796);font-size:13.5px;line-height:1.4}'+
 '.sdpx{position:absolute;top:8px;right:8px;width:40px;height:40px;border:0;background:none;color:var(--mu,#a3a796);font-size:26px;line-height:1;cursor:pointer}'+
 '.sdpst{list-style:none;margin:6px 0 4px;padding:0;display:grid;gap:8px}.sdpst a{display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,.04);border:1px solid var(--line,#2a2e24);color:var(--tx,#efeee6);text-decoration:none;min-height:44px}.sdpst a:hover{border-color:#5d6648}'+
 '.sdpst .n{flex:0 0 28px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 13px/1 system-ui,sans-serif;border:1.5px solid #5d6648;color:var(--ac2,#b3bd8c)}.sdpst .ok .n{background:var(--lime,#c8f03c);border-color:var(--lime,#c8f03c);color:#0b0c0a}.sdpst .ok .t{color:var(--mu,#a3a796)}.sdpst .t{flex:1;font-size:14.5px;line-height:1.3}.sdpst .ch{color:var(--dim,#6e7365);font-size:20px}'+
 '.sdpl{display:grid;gap:8px;margin:8px 0 10px}.sdpr{display:flex;align-items:center;gap:12px;width:100%;padding:9px 10px;background:rgba(255,255,255,.04);border:1px solid var(--line,#2a2e24);color:var(--tx,#efeee6);text-align:left;font:inherit;cursor:pointer;min-height:56px}.sdpr:hover{border-color:#5d6648}.sdpr.on{border-color:var(--lime,#c8f03c)}'+
 '.sdpr i{flex:0 0 42px;width:42px;height:42px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1.5px #5d6648}.sdpr i img{width:100%;height:100%;display:block;object-fit:cover}.sdpr span{flex:1;min-width:0}.sdpr b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sdpr small{display:block;color:var(--mu,#a3a796);font-size:12.5px;margin-top:2px}.sdpr em{font-style:normal;font:700 10px/1 system-ui,sans-serif;letter-spacing:.1em;color:var(--lime,#c8f03c)}'+
 '.sdpb{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.sdpb a,.sdpb button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 14px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.04);color:var(--tx,#efeee6);font:600 13.5px/1 system-ui,sans-serif;text-decoration:none;cursor:pointer}.sdpb .pri{background:var(--lime,#c8f03c);border-color:var(--lime,#c8f03c);color:#0b0c0a;font-weight:700}.sdpb .lk{border:0;background:none;color:var(--mu,#a3a796);padding:0 6px;text-decoration:underline}'+
 '.sdpimg{display:block;width:100%;height:auto;aspect-ratio:4/5;background:#14181b;margin:4px 0 2px}.sdpcd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0 0;font:600 12px/1.3 system-ui,sans-serif;color:var(--mu,#a3a796)}.sdpcd b{font:700 13px/1.3 ui-monospace,Menlo,Consolas,monospace;color:var(--lime,#c8f03c);letter-spacing:.02em;word-break:break-all}'+
 '.sdpvs{display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line,#2a2e24)}.sdpvs input{flex:1;min-width:0;min-height:42px;padding:0 10px;background:#0b0c0a;border:1px solid var(--line,#2a2e24);color:var(--tx,#efeee6);font:600 14px/1 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase}.sdpvs button{min-height:42px;padding:0 14px;border:1px solid #5d6648;background:rgba(143,154,106,.16);color:var(--tx,#efeee6);font:600 13.5px/1 system-ui,sans-serif;cursor:pointer}'+
 '.sdpw{color:#e0a35a!important;font-size:12.5px!important}.sdp-code{margin:12px 0 4px;padding:10px 12px;border:1px solid #3a4230;background:rgba(200,240,60,.05)}.sdp-code span{display:block;font:600 11px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mu,#a3a796)}.sdp-code b{display:block;margin:6px 0 8px;font:700 15px/1.35 ui-monospace,Menlo,Consolas,monospace;color:var(--lime,#c8f03c);word-break:break-all}.sdp-code div{display:flex;flex-wrap:wrap;gap:6px}';
 document.head.appendChild(s); }
function avHTML(){ var a=active(), S=slots(), s=a&&a.av?a:S.filter(function(x){ return x.av; })[0]; if(s) return {h:'<i><img src="'+s.av+'" alt=""></i>',has:true};
  return {h:'<i>'+SIL+'</i><b>+</b>',has:false}; }
function paint(){ var nav=document.querySelector('header.top .topnav'); if(!nav) return; css();
  if(!AV||!AV.isConnected){ AV=nav.querySelector('.sdav'); if(!AV){ AV=document.createElement('button'); AV.type='button'; AV.className='sdav'; AV.setAttribute('data-noi18n',''); AV.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); if(window.MAT_NAV&&MAT_NAV.close) MAT_NAV.close(); open(); }); } }
  var mb=nav.querySelector('.mmbtn'), ls=nav.querySelector('.langsw'); if(mb){ if(AV.previousSibling!==mb) nav.insertBefore(AV,mb.nextSibling); } else if(AV.parentNode!==nav) nav.insertBefore(AV,ls||null);
  var v=avHTML(), k=v.h; if(AV._k!==k){ AV._k=k; AV.innerHTML=k; AV.classList.toggle('has',v.has); }
  var lab=v.has?L('Tu soldado y su carta','Your soldier and card'):L('Crea tu soldado','Create your soldier'); if(AV.getAttribute('aria-label')!==lab){ AV.setAttribute('aria-label',lab); AV.title=lab; } }

/* ---------- panel ---------- */
var OV=null;
function close(){ if(!OV) return; var o=OV; OV=null; o.classList.remove('in'); document.documentElement.classList.remove('sdplock'); removeEventListener('keydown',onKey); setTimeout(function(){ if(o.parentNode) o.parentNode.removeChild(o); },220); try{ AV&&AV.focus({preventScroll:true}); }catch(e){} }
function onKey(e){ if(e.key==='Escape') close(); }
function shell(inner,wide){ css(); if(OV&&OV.parentNode) OV.parentNode.removeChild(OV); var o=document.createElement('div'); o.className='sdpov'; o.setAttribute('data-noi18n',''); o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true');
  o.innerHTML='<div class="sdpp'+(wide?' wide':'')+'"><button type="button" class="sdpx" aria-label="'+L('Cerrar','Close')+'">×</button>'+inner+'</div>'; document.body.appendChild(o); OV=o; document.documentElement.classList.add('sdplock');
  o.addEventListener('click',onClick); addEventListener('keydown',onKey); requestAnimationFrame(function(){ o.classList.add('in'); }); return o; }
function rankName(r){ try{ var n=MAT_MED.rankName(r); return EN()?n[1]:n[0]; }catch(e){ return L('Soldado','Private'); } }
function stepsHTML(){ var b=null, sol=false, cd=false; try{ b=localStorage.getItem('mat_armero_build'); }catch(e){} var S=slots(); sol=hasSoldier(jget(KEY,null))||S.some(function(x){ return hasSoldier(x.st); }); cd=S.some(function(x){ return x.ct; });
  var arm=!!(b&&b!=='null'&&b!=='{}');
  var st=[[arm,'#/armero',L('Elige tu arma','Choose your weapon'),L('Móntala en el Armero 3D','Build it in the 3D Armoury')],[sol,'#/soldado',L('Crea tu soldado','Create your soldier'),L('Rol, equipo y peso real','Role, kit and real weights')],[cd,'#/soldado?carta=1',L('Saca tu carta y compártela con tus amigos','Get your card and share it with your friends'),L('Con tu empleo y tus medallas','With your rank and medals')]];
  return '<ol class="sdpst">'+st.map(function(s,i){ return '<li><a href="'+s[1]+'" data-sdpgo="'+s[1]+'" class="'+(s[0]?'ok':'')+'"><span class="n">'+(s[0]?'✓':(i+1))+'</span><span class="t">'+s[2]+'<br><small style="color:var(--dim,#6e7365);font-size:12px">'+s[3]+'</small></span><span class="ch">›</span></a></li>'; }).join('')+'</ol>'; }
function vsBox(){ return '<form class="sdpvs" data-sdpvs><input type="text" name="c" placeholder="MAT-XXXX-…" aria-label="'+L('Código de un amigo','A friend\'s code')+'" autocomplete="off" autocapitalize="characters" spellcheck="false"><button type="submit">'+L('Comparar','Compare')+'</button></form>'; }
function open(){ var S=sync(), a=localStorage.getItem(AK), withCard=S.filter(function(x){ return x.ct; });
  if(!withCard.length){ shell('<span class="sdpk">'+L('Tu soldado','Your soldier')+'</span><h2>'+L('Crea tu soldado en 3 pasos','Create your soldier in 3 steps')+'</h2><p>'+L('Equípalo, sácale la carta con tu empleo y tus medallas y compárala con tus amigos.','Kit him out, get his card with your rank and medals and compare it with your friends.')+'</p>'+stepsHTML()+'<p style="margin:12px 0 0;font-size:12.5px">'+L('¿Te han pasado un código? Compárate:','Got a friend\'s code? Compare:')+'</p>'+vsBox()); return; }
  var one=S.length===1&&withCard.length===1; if(one){ show(S[0].id); return; } list(); }
function list(){ var S=sync(), a=localStorage.getItem(AK);
  var h='<span class="sdpk">'+L('Tu soldado','Your soldier')+'</span><h2>'+L('Mis soldados','My soldiers')+'</h2><div class="sdpl">'+S.map(function(s){ var st=s.st||{}, nm=s.nick||s.role||L('Soldado sin carta','Soldier without a card');
    return '<button type="button" class="sdpr'+(s.id===a?' on':'')+'" data-sdps="'+esc(s.id)+'"><i>'+(s.av?'<img src="'+s.av+'" alt="">':SIL)+'</i><span><b>'+esc(nm)+'</b><small>'+(s.ct?esc(rankName(s.rank))+' · '+(s.medals|0)+' '+((s.medals|0)===1?L('medalla','medal'):L('medallas','medals')):L('Sin carta todavía','No card yet'))+'</small></span>'+(s.id===a?'<em>'+L('ACTIVO','ACTIVE')+'</em>':'')+'</button>'; }).join('')+'</div>'+
    '<div class="sdpb">'+(S.length<MAX?'<button type="button" class="pri" data-sdpnew>+ '+L('Nuevo soldado','New soldier')+'</button>':'<p class="sdpw">'+L('Máximo 5 soldados en este dispositivo.','Up to 5 soldiers on this device.')+'</p>')+'</div>'+vsBox();
  shell(h); }
function show(id){ var S=sync(), s=S.filter(function(x){ return x.id===id; })[0]; if(!s){ list(); return; } if(!s.ct){ activate(id); close(); go('#/soldado'); return; }
  var u=s.code?location.origin+location.pathname+'#/soldado?vs='+s.code.replace(/-/g,''):'';
  var h='<span class="sdpk">'+L('Tu soldado','Your soldier')+(S.length>1?' · <a href="#" data-sdplist style="color:inherit">'+L('Mis soldados','My soldiers')+' ('+S.length+')</a>':'')+'</span><h2>'+esc(s.nick||s.role||L('Mi soldado','My soldier'))+'</h2>'+
    (s.img?'<img class="sdpimg" src="'+s.img+'" alt="'+L('Carta de tu soldado','Your soldier card')+'" width="640" height="800">':'<p>'+L('La carta no cabe en este dispositivo; vuelve a sacarla.','The card did not fit on this device; make it again.')+'</p>')+
    (s.code?'<div class="sdpcd"><span>'+L('Código','Code')+'</span><b>'+esc(s.code)+'</b></div>':'')+
    '<div class="sdpb">'+(s.img?'<button type="button" class="pri" data-sdpsend="'+esc(id)+'">'+L('Enviar carta','Send card')+'</button>':'')+(u?'<a href="https://wa.me/?text='+encodeURIComponent(L('¿Quién tiene mejor soldado? Compara el tuyo con el mío en M.A.T: ','Who has the better soldier? Compare yours with mine on M.A.T: ')+u)+'" target="_blank" rel="noopener">'+L('Enviar mi código','Send my code')+'</a>':'')+(s.code?'<button type="button" data-sdpcopy="'+esc(s.code)+'">'+L('Copiar código','Copy code')+'</button>':'')+
    '<button type="button" data-sdpedit="'+esc(id)+'">'+L('Editar soldado','Edit soldier')+'</button>'+(S.length<MAX?'<button type="button" data-sdpnew>+ '+L('Nuevo soldado','New soldier')+'</button>':'')+'</div>'+vsBox()+
    '<div class="sdpb" style="margin-top:6px"><button type="button" class="lk" data-sdpdel="'+esc(id)+'">'+L('Borrar este soldado','Delete this soldier')+'</button></div>';
  shell(h,false); }
function toast(t){ var o=OV&&OV.querySelector('.sdpp'); if(!o) return; var p=document.createElement('p'); p.className='sdpw'; p.style.color='var(--lime,#c8f03c)'; p.textContent=t; o.appendChild(p); setTimeout(function(){ if(p.parentNode) p.parentNode.removeChild(p); },2200); }
function copy(t){ var ok=function(){ toast(L('Código copiado','Code copied')); }; if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){}); }
function sendCard(id){ var s=slots().filter(function(x){ return x.id===id; })[0]; if(!s||!s.img) return; fetch(s.img).then(function(r){ return r.blob(); }).then(function(b){ var f=null; try{ f=new File([b],'mat-soldado.jpg',{type:'image/jpeg'}); }catch(e){}
  if(f&&navigator.canShare&&navigator.share&&navigator.canShare({files:[f]})) return navigator.share({files:[f],text:L('Mi soldado en M.A.T · matmilitar.es','My soldier on M.A.T · matmilitar.es')}).catch(function(){});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='mat-soldado.jpg'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }); }
function onClick(e){ var t=e.target; if(t===OV||t.closest('.sdpx')){ close(); return; } var b;
  if((b=t.closest('[data-sdpgo]'))){ e.preventDefault(); var h=b.getAttribute('data-sdpgo'); close(); go(h); return; }
  if((b=t.closest('[data-sdps]'))){ show(b.getAttribute('data-sdps')); return; }
  if(t.closest('[data-sdplist]')){ e.preventDefault(); list(); return; }
  if(t.closest('[data-sdpnew]')){ if(fresh()){ close(); paint(); go('#/soldado'); } return; }
  if((b=t.closest('[data-sdpedit]'))){ activate(b.getAttribute('data-sdpedit')); close(); paint(); go('#/soldado'); return; }
  if((b=t.closest('[data-sdpdel]'))){ if(confirm(L('¿Borrar este soldado de este dispositivo?','Delete this soldier from this device?'))){ drop(b.getAttribute('data-sdpdel')); paint(); if(slots().some(function(x){ return x.ct; })) list(); else open(); } return; }
  if((b=t.closest('[data-sdpcopy]'))){ copy(b.getAttribute('data-sdpcopy')); return; }
  if((b=t.closest('[data-sdpsend]'))){ sendCard(b.getAttribute('data-sdpsend')); return; }
  if(t.closest('a[href^="#/"]')){ close(); } }
document.addEventListener('submit',function(e){ var f=e.target; if(!f||!f.hasAttribute||!f.hasAttribute('data-sdpvs')) return; e.preventDefault(); var c=norm(f.elements.c.value); if(c.length<12){ f.elements.c.focus(); return; } close(); go('#/soldado?vs='+c); },true);
document.addEventListener('click',function(e){ var b=e.target&&e.target.closest?e.target.closest('.sdp-code [data-sdpcopy]'):null; if(!b) return; var t=b.getAttribute('data-sdpcopy'); if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function(){ b.textContent=L('¡Copiado!','Copied!'); },function(){}); },true);

/* un enlace compartido (#/soldado?s=…) no pisa tu soldado con carta: entra como soldado nuevo */
function guard(){ try{ if(/^#\/soldado\?(?:.*&)?s=/.test(location.hash)){ var a=active(); if(a&&a.ct&&slots().length<MAX&&JSON.stringify(jget(KEY,null))===JSON.stringify(a.st||null)) fresh(); } }catch(e){} }
guard();
window.MAT_SDP={encode:encode,decode:decode,card:card,codeRow:codeRow,slots:slots,sync:sync,active:active,open:open,norm:norm,paint:paint};
function tick(){ try{ paint(); }catch(e){} }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',tick); else tick();
addEventListener('hashchange',function(){ try{ if(OV) close(); sync(); guard(); }catch(e){} setTimeout(tick,0); });
addEventListener('pagehide',function(){ try{ sync(); }catch(e){} });
addEventListener('storage',function(e){ if(e.key===SK||e.key===AK||e.key===null){ AV&&(AV._k=''); tick(); } });
setInterval(function(){ var mb=AV&&AV.parentNode?AV.parentNode.querySelector('.mmbtn'):null; if(!AV||!AV.isConnected||(mb&&AV.previousSibling!==mb)) tick(); },1500);
})();
