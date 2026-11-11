/* M.A.T · Comparar soldados (#/soldado?vs=<código>): tu carta y la de tu amigo, lado a lado (una encima de otra en el móvil).
   El código lleva sus propios datos (no hay servidor), así que no se puede verificar: es un juego. */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let RUN=0;
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
/* duelo 1 vs 1 (soldado_duelo.js, solo se carga al abrirlo) */
function duel(code,F,X,o){ import('./soldado_duelo.js?v='+VER).then(m=>m.open(X,Object.assign({code,F},o||{}))).catch(e=>console.warn('duelo',e)); }
function duelBtn(){ return '<button type="button" class="pri" data-vsduel>⚔️ '+(window.MAT_LANG==='en'?'Fight 1 vs 1':'Luchar 1 vs 1')+'</button>'; }
function bindDuel(box,code,F,X){ const b=box.querySelector('[data-vsduel]'); if(b) b.onclick=()=>duel(code,F,X,{}); }
function css(){ if(document.getElementById('sdvscss')) return; const s=document.createElement('style'); s.id='sdvscss'; s.textContent=
 '.sdvs{margin:6px 0 18px;padding:16px;background:linear-gradient(165deg,#1d2018 0%,#14160f 60%,#0f110c 100%);clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%)}'+
 '.sdvs .k{display:block;font:600 10.5px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--lime,#c8f03c);margin-bottom:7px}.sdvs h2{margin:0 0 4px;font-size:22px}.sdvs>p{margin:2px 0 12px;color:var(--mu,#a3a796);font-size:13.5px;line-height:1.4}'+
 '.sdvs .cs{display:grid;grid-template-columns:1fr;gap:12px}@media (min-width:700px){.sdvs .cs{grid-template-columns:1fr 1fr}}'+
 '.sdvs figure{margin:0;min-width:0}.sdvs figcaption{font:700 12px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--mu,#a3a796);margin:0 0 6px}.sdvs figure img,.sdvs .ph{display:block;width:100%;height:auto;aspect-ratio:4/5;background:#14181b}'+
 '.sdvs .ph{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:16px;text-align:center;color:var(--mu,#a3a796);font-size:14px;border:1px dashed #3a4230}'+
 '.sdvs table{width:100%;border-collapse:collapse;margin:4px 0 14px;font-size:14px}.sdvs th,.sdvs td{padding:9px 6px;border-bottom:1px solid var(--line,#2a2e24);text-align:center}.sdvs th{font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu,#a3a796)}'+
 '.sdvs td:first-child,.sdvs th:first-child{text-align:left;color:var(--mu,#a3a796)}.sdvs td.w{color:#0b0c0a;background:var(--lime,#c8f03c);font-weight:700}.sdvs td.w:after{content:" ▲";font-size:10px}'+
 '.sdvs .b{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.sdvs .b a,.sdvs .b button{display:inline-flex;align-items:center;min-height:42px;padding:0 14px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.04);color:var(--tx,#efeee6);font:600 13.5px/1 system-ui,sans-serif;text-decoration:none;cursor:pointer}.sdvs .b .pri{background:var(--lime,#c8f03c);border-color:var(--lime,#c8f03c);color:#0b0c0a;font-weight:700}'+
 '.sdvs .n{font-size:12px;color:var(--dim,#6e7365);margin:8px 0 0}.sdvs form{display:flex;gap:8px;margin-top:8px}.sdvs input{flex:1;min-width:0;min-height:42px;padding:0 10px;background:#0b0c0a;border:1px solid var(--line,#2a2e24);color:var(--tx,#efeee6);font:600 14px/1 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase}.sdvs form button{min-height:42px;padding:0 14px;border:1px solid #5d6648;background:rgba(143,154,106,.16);color:var(--tx,#efeee6);font:600 13.5px/1 system-ui,sans-serif;cursor:pointer}'+
 '.sdvs .vh{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:8px;margin:6px 0 14px}.sdvs .vh>div{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;text-align:center}.sdvs .vh b{display:block;max-width:100%;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sdvs .vh small{display:block;font-size:12px;color:var(--mu,#a3a796)}.sdvs .vh>em{font:800 15px/1 system-ui,sans-serif;font-style:normal;color:var(--lime,#c8f03c);letter-spacing:.06em}.sdvs figcaption{display:flex;align-items:center;gap:7px}';
 document.head.appendChild(s); }
const nf=(n,d)=>{ try{ return (+n).toLocaleString(window.MAT_LANG==='en'?'en-GB':'es-ES',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}); }catch(e){ return String(n); } };
function blobURL(cv){ return new Promise(r=>cv.toBlob(b=>r(b?URL.createObjectURL(b):null),'image/jpeg',0.86)); }
export async function show(code,X){ const L=X.L, my=++RUN; css();
  const app=document.getElementById('app'); if(!app) return; let box=document.getElementById('sdvs'); if(!box){ box=document.createElement('section'); box.id='sdvs'; box.className='sdvs'; box.setAttribute('data-noi18n','');
    const h1=app.querySelector('h1'); const at=h1&&h1.parentNode===app?h1.nextSibling:(h1?h1.closest('div')&&h1.closest('div').nextSibling:null); if(at&&at.parentNode) at.parentNode.insertBefore(box,at); else app.insertBefore(box,app.firstChild); }
  let form=window.MAT_SDP?MAT_SDP.codeRow(''):''; const bind=()=>{};
  if(!code||!window.MAT_SDP){ box.innerHTML='<span class="k">'+L('Comparar','Compare')+'</span><h2>'+L('Compárate con un amigo','Compare with a friend')+'</h2><p>'+L('Pega el código de soldado de tu amigo (empieza por SOL- y sale en su carta).','Paste your friend\'s soldier code (it starts with SOL- and is on their card).')+'</p>'+form; bind(); box.scrollIntoView({block:'start'}); return; }
  const F=window.MAT_SDP.decode(X,code);
  if(F.err){ box.innerHTML='<span class="k">'+L('Comparar','Compare')+'</span><h2>'+L('Ese código no es válido','That code is not valid')+'</h2><p>'+(F.err==='sum'?L('Parece que hay una letra mal copiada. Revísalo o pídeselo otra vez a tu amigo.','A character seems to be mistyped. Check it or ask your friend again.'):L('No es un código de soldado de M.A.T.','It is not an M.A.T soldier code.'))+'</p>'+form; bind(); box.scrollIntoView({block:'start'}); return; }
  box.innerHTML='<span class="k">'+L('Comparar','Compare')+'</span><h2>'+L('Tu soldado contra el de ','Your soldier vs ')+esc(F.nick||L('tu amigo','your friend'))+'</h2><p>'+L('Preparando las dos cartas…','Preparing both cards…')+'</p><div class="b">'+duelBtn()+'</div>'; bindDuel(box,code,F,X);
  box.scrollIntoView({block:'start'});
  { const qp=new URLSearchParams(location.hash.split('?')[1]||''); if(qp.get('duelo')) duel(code,F,X,{map:qp.get('duelo'),a:qp.get('a')||'',r:+qp.get('r')||1}); }
  const [CARD]=await Promise.all([X.card(),X.arm().catch(()=>null)]); if(my!==RUN) return;
  /* amigo */ const fd=X.dataFor(F.st); fd.nick=F.nick; fd.ico=F.ico||null; fd.med=window.MAT_MED&&MAT_MED.cardOf?MAT_MED.cardOf(F.rank,F.top,F.count):null; fd.code=window.MAT_SDP.encode({D:X.D,RL:X.RL,st:()=>F.st},fd);
  fd.snap=await X.snapFor(F.st); if(my!==RUN) return; const fu=await blobURL(await CARD.renderCard(fd)); if(my!==RUN) return;
  /* tú: tu soldado activo (si tiene algo) */ const mst=X.st(); const mine=(mst.role||Object.keys(mst.q||{}).some(k=>mst.q[k]>0))?mst:null; let md=null, mu=null;
  if(mine){ md=X.dataFor(mine); try{ md.code=window.MAT_SDP.encode(X,md); }catch(e){} md.snap=await X.mySnap(); if(my!==RUN) return; mu=await blobURL(await CARD.renderCard(md)); if(my!==RUN) return; }
  const rows=[]; const row=(n,a,b,fa,fb,hi)=>{ let wa='',wb=''; if(a!=null&&b!=null&&a!==b){ const aw=hi?a>b:a<b; wa=aw?'w':''; wb=aw?'':'w'; } rows.push('<tr><td>'+n+'</td><td class="'+wa+'">'+fa+'</td><td class="'+wb+'">'+fb+'</td></tr>'); };
  const rn=d=>d&&d.med?(window.MAT_LANG==='en'?d.med.name[1]:d.med.name[0]):L('Soldado','Private');
  if(md){ row(L('Empleo','Rank'),md.med?md.med.rank:0,fd.med?fd.med.rank:0,esc(rn(md)),esc(rn(fd)),true);
    row(L('Medallas','Medals'),md.med?md.med.count:0,fd.med?fd.med.count:0,nf(md.med?md.med.count:0),nf(fd.med?fd.med.count:0),true);
    const ld=md.tot>0&&fd.tot>0; row(L('Carga total','Total load'),ld?Math.round(md.tot*10):null,ld?Math.round(fd.tot*10):null,nf(md.tot,1)+' kg',nf(fd.tot,1)+' kg',false);
    if(md.pct!=null&&fd.pct!=null) row(L('% de su peso','% of body weight'),ld?Math.round(md.pct):null,ld?Math.round(fd.pct):null,nf(md.pct,0)+' %',nf(fd.pct,0)+' %',false); }
  const meName=md&&md.nick?esc(md.nick):L('Tú','You'), frName=esc(F.nick||L('Tu amigo','Your friend'));
  /* iconos de perfil (perfil.js): el tuyo y el del código de tu amigo (un código antiguo, sin icono, sale con el soldado) */
  const IC=window.MAT_SDP&&MAT_SDP.ico, mr=md&&md.med?md.med.rank:(IC?IC.rank():0), ic=(id,r,z,ins)=>IC?IC.html(id,r,z,ins):'';
  const icM=sz=>ic(IC?IC.get():'soldado',mr,sz,sz>=56), icF=sz=>ic(F.ico||'soldado',F.rank|0,sz,sz>=56);
  const vh=IC?'<div class="vh"><div>'+icM(64)+'<b>'+meName+'</b><small>'+esc(rn(md)||'')+'</small></div><em>VS</em><div>'+icF(64)+'<b>'+frName+'</b><small>'+esc(rn(fd))+'</small></div></div>':'';
  box.innerHTML='<span class="k">'+L('Comparar','Compare')+'</span><h2>'+meName+' vs '+frName+'</h2><p>'+(md?L('Gana quien tenga más empleo y medallas; en la carga, menos peso es más movilidad.','Higher rank and more medals win; for load, less weight means more mobility.'):L('Tu amigo ya tiene su soldado. Crea el tuyo aquí abajo y compárate.','Your friend already has a soldier. Create yours below and compare.'))+'</p>'+vh+
    (rows.length?'<table><thead><tr><th></th><th>'+meName+'</th><th>'+frName+'</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>':'')+
    '<div class="cs"><figure><figcaption>'+icM(26)+meName+'</figcaption>'+(mu?'<img src="'+mu+'" alt="'+L('Tu carta','Your card')+'" width="1080" height="1350">':'<div class="ph">'+L('Todavía no tienes soldado','You have no soldier yet')+'<a class="sd-btn" href="#/soldado" data-vsmk>'+L('Crear mi soldado','Create my soldier')+'</a></div>')+'</figure>'+
    '<figure><figcaption>'+icF(26)+frName+'</figcaption><img src="'+fu+'" alt="'+L('Carta de tu amigo','Your friend\'s card')+'" width="1080" height="1350"></figure></div>'+
    '<div class="b">'+duelBtn()+(md&&md.code?'<a class="pri" href="https://wa.me/?text='+encodeURIComponent(L('Te reto: compara tu soldado con el mío en M.A.T: ','I challenge you: compare your soldier with mine on M.A.T: ')+location.origin+location.pathname+'#/soldado?vs='+md.code)+'" target="_blank" rel="noopener">'+L('Enviar mi código','Send my code')+'</a>':'')+'<a href="#/soldado">'+L('Cerrar comparación','Close comparison')+'</a></div>'+
    (md&&md.code&&window.MAT_SDP?'':'')+'<p class="n">'+L('El código lleva sus propios datos y no se comprueba en ningún servidor: es un juego. La foto de tu amigo sale de pie.','The code carries its own data and is not checked on any server: it is a game. Your friend\'s photo is shown standing.')+'</p>'+(md&&md.code&&window.MAT_SDP?MAT_SDP.codeRow(md.code):form);
  bind(); bindDuel(box,code,F,X); const mk=box.querySelector('[data-vsmk]'); if(mk) mk.onclick=e=>{ e.preventDefault(); const t=document.getElementById('sdrole')||document.querySelector('.sd-card'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); };
}
