
(function(){
"use strict";
// ======================= M.A.T · DUELO v2 =======================
var MCAT={cielo:['aviones','helicopteros'],suelo:['tanques','blindados'],mar:['buques','submarinos'],sub:['submarinos']};
var MN={cielo:'Aire',suelo:'Tierra',mar:'Mar',sub:'Bajo el mar'};
var MD={cielo:'aviones y helicópteros armados',suelo:'carros de combate y blindados armados',mar:'buques de guerra',sub:'submarinos'};
var NONCOMBAT={transporte:1,cisterna:1,awacs:1,patrulla:0};
function armTxt(a){var F=a.F||{};return [(a.arm||[]).join(' · '),F.arm_principal,F.arm_secundario,F.municion].filter(Boolean).join(' · ');}
function combat(a){
  if(a.cat==='tanques') return true;
  if(a.cat==='blindados') return !!a.dz;
  if(a.cat==='aviones'||a.cat==='helicopteros'){ if(NONCOMBAT[a.tipo]||!(a.arm&&a.arm.length)) return false; if(a._cb==null){var L=weaponsOf(a,'cielo').filter(function(w){return w.k!=='bomb_air'&&w.k!=='std';}); if(a.cat==='aviones') L=L.filter(function(w){return /bvr|wvr|gun_air/.test(w.k);}); if(a.tipo==='h_transporte') L=L.filter(function(w){return w.k!=='gun_air';}); a._cb=L.length>0;} return a._cb; }
  if(a.cat==='buques'||a.cat==='submarinos') return !!a.dz;
  return false;
}
// ---------- weapons from the ficha ----------
function rx(s,r){var m=String(s||'').match(r);return m?m[0]:null;}
function ext(t,m){var e=t.slice(m.index+m[0].length).match(/^[A-Za-z0-9]*(?:-[0-9]+[A-Za-z]?)?/); var s=m[0]+(e?e[0]:''); return /-$/.test(s)?s.slice(0,-1):s;}
function rxs(s,r){var t=String(s||''),best=null; var g=new RegExp(r.source,'gi'),m; while((m=g.exec(t))){ if(!/^(antibuque|anti-?ship|antitanque|contracarros?|anti-?tank|ATGM)$/i.test(m[0])) return /-$/.test(m[0])?ext(t,m):m[0]; if(!best) best=m[0]; if(g.lastIndex===m.index) g.lastIndex++;} return best;}
function linesOf(a){var F=a.F||{}; var L=[]; (a.arm||[]).forEach(function(x){L.push(x);}); [F.arm_principal,F.arm_secundario].forEach(function(x){if(x) String(x).split(/;|·|\n/).forEach(function(y){if(y.trim()) L.push(y.trim());});}); return L;}
function short(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>(n||60)?s.slice(0,(n||60)-1)+'…':s;}
var AAM_BVR=/AIM-120|AMRAAM|Meteor|R-77|RVV-AE|R-27|PL-1[25]|PL-21|AIM-7|Sparrow|Skyflash|MICA|Derby|AIM-54|Phoenix|R-33|R-37|R-40|Super 530|R\.530|Aspide|Astra|AAM-4|K-100|Fakour|R-23|R-24|Matra 530/i;
var AAM_WVR=/AIM-9|Sidewinder|R-73|R-60|IRIS-T|Python|ASRAAM|Magic|R\.550|PL-[5789]\b|PL-10|Shafrir|AAM-3|AAM-5|K-13|R-3S|R-13|Firestreak|Red Top|Stinger|Mistral|Igla|Strela/i;
var ATGM=/Hellfire|Spike|HOT\b|TOW|Ataka|Shturm|Vikhr|Kornet|Konkurs|Fagot|Refleks|Svir|Kobra|LAHAT|MILAN|Javelin|Brimstone|Helina|Nag|HJ-\d|AKD-|Trigat|Malyutka|Sagger|Bastion|Falanga|antitanque|contracarros?|anti-?tank|ATGM/i;
var ASHM_GEN=/antibuque|anti-?ship/i;
var ASHM=/Harpoon|Exocet|NSM|Naval Strike|Kalibr|Klub|Oniks|Yakhont|BrahMos|Granit|Moskit|Uran|Kh-35|P-15|P-500|P-700|P-800|Termit|Styx|SS-N-|YJ-|C-80\d|Otomat|Teseo|RBS[- ]?15|Gabriel|Hsiung|Type 90 SSM|Type 17|SSM-|Penguin|Sea Eagle|Sea Skua|Tomahawk|Zircon|antibuque|anti-?ship/i;
var TORP=/torpedo/i;
var CIWS=/Phalanx|Goalkeeper|Meroka|CIWS|AK-630|Kashtan|Pantsir|SeaRAM|RAM\b|Type 730|Type 1130|Millennium/i;
var SAM=/Standard|SM-[1-6]|ESSM|Sea Sparrow|Aster|Barak|Sea Wolf|Sea Dart|Sea Ceptor|CAMM|S-300|Fort|Shtil|Buk|Kinzhal|Kortik|Osa|Tor|HHQ|HQ-|Aspide|Albatros|Crotale|Mistral|Sadral|superficie-aire|antiaére/i;
function W(id,n,k,o){o=o||{};o.id=id;o.n=n;o.k=k;return o;}
function weaponsOf(a,mode){
  var T=armTxt(a), L=linesOf(a), out=[], seen={};
  function add(w){if(seen[w.id]) return; seen[w.id]=1; out.push(w);}
  function lineWith(r){for(var i=0;i<L.length;i++){if(r.test(L[i])) return L[i];} return null;}
  if(mode==='suelo'){
    var gun=lineWith(/cañ[oó]n|obús|howitzer|gun|mm/i)||'';
    var cal=a.cal||null, F=a.F||{}, mun=(F.municion||'')+' '+T;
    if(/APFSDS|APDS|flecha|subcalibre|energía cinética|kinetic/i.test(mun)) add(W('ke',(rx(mun,/APFSDS[-\w]*/i)||'APFSDS')+' (perforante cinético)','ke',{line:gun}));
    if(/HEAT|carga hueca|hueca|HEAT-FS/i.test(mun)) add(W('heat',(rx(mun,/HEAT[-\w]*/i)||'HEAT')+' (carga hueca)','heat',{line:gun}));
    if(/HESH|HEP\b/i.test(mun)) add(W('hesh',(rx(mun,/HESH|HEP/i))+' (cabeza aplastante)','hesh',{line:gun}));
    if(/\bAPC?B?C?\b|APHE|APCR|APBC|perforante/i.test(mun)&&!seen.ke) add(W('ap','Perforante (AP)','ap',{line:gun}));
    if(/\bHE\b|HE-|HE-FRAG|OFS|explosiv|rompedor|alto explosivo|fragmentación/i.test(mun)) add(W('he','Explosivo (HE)','he',{line:gun}));
    var mun_atgm_pen=null; var pm=String(mun).match(/(?:penetra\w*|perforaci[oó]n|perforar|perfora\b)[^.;\d]{0,50}?(\d{2,4}(?:[.,]\d+)?)\s*mm/i); if(pm){var pv=parseFloat(esN(pm[1]).replace(',','.')); var ctxp=String(mun).slice(Math.max(0,pm.index-140),pm.index); var tgt=/misil|ATGM|9M1|guiad/i.test(ctxp)?null:out.filter(function(x){return x.k==='ke'||x.k==='heat';})[0]; if(!tgt) mun_atgm_pen=pv; if(tgt&&pv>=40&&pv<=1500){tgt.penmm=pv; tgt.pensrc=short(pm[0],80);}}
    var atg=lineWith(ATGM)||(ATGM.test(mun)?rx(mun,ATGM):null); if(atg) add(W('atgm','Misil '+short(rxs(atg,ATGM)||'contracarro',24),'atgm',{line:atg,tok:rxs(atg,ATGM)})); if(mun_atgm_pen){ var aw_=out.filter(function(x){return x.k==='atgm';})[0]; if(aw_&&mun_atgm_pen>=100&&mun_atgm_pen<=1500){ aw_.penmm=mun_atgm_pen; aw_.pensrc='ficha'; } }
    if(a.tipo==='b_mlr'||/cohete|rocket/i.test(gun)) add(W('rk','Cohetes ('+short(gun,40)+')','rk',{line:gun}));
    if(a.tipo==='b_art'||/obús|howitzer/i.test(gun)) add(W('art','Fuego de artillería ('+(cal?cal+' mm':'obús')+')','art',{line:gun}));
    if(a.tipo==='b_aa') add(W('aa','Cañones/misiles antiaéreos en tiro directo','ac',{line:gun}));
    var ac=lineWith(/cañ[oó]n automático|autocannon|chain gun|2A42|2A72|Bushmaster|M242|Mk 44|Rh 503|\b(20|23|25|30|35|40)\s?mm/i);
    if(ac&&(!cal||cal<=57)) add(W('ac','Cañón automático ('+short(rx(ac,/\d+\s?mm/)||ac,20)+')','ac',{line:ac}));
    var hasAmmo=out.some(function(x){return /ke|heat|hesh|ap|he/.test(x.k)&&x.k!=='heat_'||false;});
    if(!hasAmmo&&cal&&cal>=37&&a.tipo!=='b_art'&&a.tipo!=='b_mlr'&&a.tipo!=='b_aa'){var cs=String(cal).replace('.',',')+' mm'; add(W('ke','Perforante '+cs+' (munición genérica)','ke',{line:gun,gen:1})); add(W('he','Explosivo '+cs+' (munición genérica)','he',{line:gun,gen:1}));}
    if(!out.length&&cal&&cal>57) add(W('gun','Cañón principal '+String(cal).replace('.',',')+' mm','gun',{line:gun}));
    if(!out.length&&cal) add(W('ac','Arma principal '+String(cal).replace('.',',')+' mm','ac',{line:gun}));
    var mg=lineWith(/ametralladora|machine gun|MG\d|M2HB|Browning|PKT|DShK|NSVT|KPV|MAG/i); if(mg) add(W('mg','Ametralladora ('+short(rx(mg,/\d+[.,]?\d*\s?mm/)||'según ficha',16)+')','mg',{line:mg}));
  } else if(mode==='cielo'){
    var b=lineWith(AAM_BVR); if(b) add(W('bvr','Misil '+short(rx(b,AAM_BVR),22)+' (más allá del alcance visual)','bvr',{line:b,tok:rx(b,AAM_BVR)}));
    var w=lineWith(AAM_WVR); if(w) add(W('wvr','Misil '+short(rx(w,AAM_WVR),22)+' (corto alcance)','wvr',{line:w,tok:rx(w,AAM_WVR)}));
    if(!b&&!w&&/aire-aire|air-to-air|AAM/i.test(T)) add(W('wvr','Misiles aire-aire','wvr',{line:lineWith(/aire-aire|air-to-air|AAM/i)}));
    var at=lineWith(ATGM); if(at&&a.cat==='helicopteros') add(W('atgm','Misil '+short(rxs(at,ATGM),22)+' (contracarro)','atgm_air',{line:at,tok:rxs(at,ATGM)}));
    var g=lineWith(/cañ[oó]n|cannon|GAU|GSh|M61|Vulcan|DEFA|ADEN|Mauser|\d+\s?mm|ametralladora|machine gun/i); if(g) add(W('gun','Cañón ('+short(rx(g,/\d+[.,]?\d*\s?mm/)||'según ficha',14)+')','gun_air',{line:g}));
    var rk=L.filter(function(x){return /cohete|rocket/i.test(x)&&!/misil|missile|bomba|bomb/i.test(x);})[0]; if(rk) add(W('rk','Cohetes ('+short(rk,26)+')','rk_air',{line:rk}));
    var bo=lineWith(/bomba|bomb/i); if(bo&&!out.length) add(W('bomb','Bombas (no aptas contra aviones)','bomb_air',{line:bo}));
  } else if(mode==='mar'){
    var as=lineWith(ASHM); if(as) add(W('ashm',(/^anti/i.test(rxs(as,ASHM))?'Misiles antibuque':'Misil antibuque '+short(rxs(as,ASHM),18)),'ashm',{line:as,tok:rxs(as,ASHM)}));
    var t=lineWith(TORP); if(t) add(W('torp','Torpedos ('+short(rx(t,/\d+[.,]?\d*\s?mm|Mk[-\s]?\d+|Mark \d+|\d+ pulgadas/i)||'según ficha',16)+')','torp',{line:t}));
    var gn=lineWith(/cañ[oó]n|gun|\d+\s?(mm|in)/i); if(gn) add(W('gun','Artillería naval ('+short(rx(gn,/\d+([.,]\d+)?\s?(mm|in)/i)||'según ficha',14)+')','navgun',{line:gn}));
    if(!out.length&&lineWith(SAM)) add(W('sam','Misiles superficie-aire en modo antibuque','ashm_weak',{line:lineWith(SAM)}));
  } else {
    var t2=lineWith(TORP); if(t2) add(W('torp','Torpedos ('+short(rx(t2,/\d+[.,]?\d*\s?mm|Mk[-\s]?\d+|Mark \d+|\d+ pulgadas|[0-9]{3}\s?mm/i)||'según ficha',16)+')','torp',{line:t2}));
    var as2=lineWith(ASHM); if(as2) add(W('ashm','Misil '+short(rxs(as2,ASHM),18)+' lanzado en inmersión','sub_ashm',{line:as2,tok:rxs(as2,ASHM)}));
    var gn2=lineWith(/cañ[oó]n|deck gun|gun|\d+\s?mm/i); if(gn2&&!t2) add(W('gun','Cañón de cubierta','navgun',{line:gn2}));
  }
  if(!out.length) out.push(W('std','Armamento de la ficha','std',{line:L[0]||''}));
  return out;
}
// ---------- simulation (game rules, not real-world predictions) ----------
function R(){return Math.random();}
function era(a){return a.anio||1950;}
function esN(s){return String(s||'').replace(/(\d)\.(\d{3})(?!\d)/g,'$1$2');}
function blindMM(a){var F=a.F||{},s=esN(String(F.blindaje||'')+' '+String(F.proteccion||'')),m,mx=0,re=/(\d{1,4}(?:[.,]\d+)?)\s*mm/g; while((m=re.exec(s))){var v=parseFloat(m[1].replace(',','.')); if(v<=1500&&v>mx) mx=v;} return mx||null;}
/* Blindaje frontal del carro frente a perforantes (KE/APFSDS) y frente a carga hueca (HEAT), leído de la ficha; si la ficha no lo da, estimación por época */
function armFig(a){ if(a._af) return a._af; var F=a.F||{}, s=esN(F.blindaje||''), r={ke:null,ce:null,q:null,src:'ficha',ceest:false}, m;
  function first(c){ var e=c.indexOf('='), x=(e>=0?c.slice(e):c).match(/(\d{2,4})\s*(?:mm)?\s*(?:[–-]\s*\d{2,4}\s*)?mm/); return x?+x[1]:null; }
  m=s.match(/(?:APFSDS|KE)\s*:\s*([^;]*)/i); if(m){ r.ke=first(m[1]); if(r.ke) r.q=m[0]; }
  m=s.match(/HEAT\s*:\s*([^;]*)/i); if(m){ r.ce=first(m[1]); }
  if(!r.ke||!r.ce){ var re=/(\d{2,4})(?:\s*mm)?(?:\s*(?:[–-]|a)\s*\d{2,4})?\s*mm\s+(?:frente a|contra)\s+(?:la\s+)?(?:munici[oó]n\s+)?(APFSDS|cin[eé]tic\w*|KE|HEAT)/gi, x;
    while((x=re.exec(s))){ var isC=/HEAT/i.test(x[2]); if(isC&&!r.ce) r.ce=+x[1]; if(!isC&&!r.ke){ r.ke=+x[1]; var st=Math.max(0,s.lastIndexOf(';',x.index)+1); r.q=s.slice(st,x.index+x[0].length).trim(); } } }
  if(!r.ke){ m=s.match(/equivalente a (?:unos )?(\d{2,4})/i)||s.match(/\((\d{2,4})\s*mm de RHAe?\)/i); if(m){ r.ke=+m[1]; r.q=m[0]; } }
  if(!r.ke){ var mx=0, y, rr=/(\d{2,4})\s*mm\s*(?:de\s+)?RHAe?/gi; while((y=rr.exec(s))){ var cl=s.slice(Math.max(0,s.lastIndexOf(';',y.index)+1),y.index); if(/lateral|trasera|techo|superior\b|piso/i.test(cl)&&!/frontal|glacis superior/i.test(cl)) continue; if(+y[1]>mx&&+y[1]<=1500) mx=+y[1]; } if(mx){ r.ke=mx; r.ce=r.ce||mx; r.q=short(s,90); } }
  if(r.ke&&r.ke>1500) r.ke=null;
  if(!r.ke){ var e=era(a), t=a.cat==='tanques'; r.src='est'; r.q=null; r.ke=t?(e>1990?550:e>1980?450:e>1965?300:e>1950?150:e>1940?80:30):(e>1990?40:20); r.ce=t&&e>1975?Math.round(r.ke*1.5):r.ke; }
  if(!r.ce){ r.ce=era(a)>1975?Math.round(r.ke*1.5):r.ke; r.ceest=true; }
  a._af=r; return r; }
function armour(a){ if(a.cat==='tanques') return armFig(a).ke; if(a.blind) return a.blind; return era(a)>1990?40:20; }
function pen(w,a){ if(w.penmm) return w.penmm; var c=a.cal||20, e=era(a);
  switch(w.k){case 'ke':return c*(e>1990?5.5:e>1975?4.5:3.2); case 'heat':return c*(e>1980?4:3.2); case 'hesh':return c*1.4; case 'ap':return c*1.6; case 'he':return c*0.5;
   case 'atgm':return e>1995?900:e>1975?650:450; case 'gun':return c*2.2; case 'ac':return Math.max(15,c*2.2); case 'mg':return 14; case 'rk':return 60; case 'art':return c*0.6; default:return c;}}
function defMod(w,t){ var modern=t.cat==='tanques'&&era(t)>1982; if(w.k==='heat'&&modern) return 0.6; if(w.k==='atgm'&&modern) return 0.8; return 1;}
function blast(w){return w.k==='he'||w.k==='art'||w.k==='rk'||w.k==='hesh';}
var ZONES=[['frontal',0.55,1,'el frente'],['lateral',0.35,0.4,'el lateral'],['trasera',0.10,0.2,'la parte trasera']]; // regla del juego: el lateral ≈40 % y la trasera ≈20 % del blindaje máximo
function zoneArm(t,z){return Math.round(armour(t)*z[2]);}
function effPen(w,s,t){return Math.round(pen(w,s)*defMod(w,t));}
function groundShot(w,s,t){
  var acc={ke:0.78,heat:0.7,hesh:0.68,ap:0.7,he:0.72,atgm:0.82,gun:0.72,ac:0.65,mg:0.7,rk:0.5,art:0.42,std:0.6}[w.k]||0.6;
  if(era(s)>1985) acc+=0.08; if(t.cat==='blindados'&&!t.blind) acc+=0.03;
  var hit=R()<acc; if(!hit) return {hit:false,dmg:0,txt:'falla'};
  var r=R(),z=ZONES[0]; if(r>0.55) z=ZONES[1]; if(r>0.9) z=ZONES[2];
  var P=effPen(w,s,t), A=zoneArm(t,z), where=z[0]==='frontal'?'en el frente':'en '+z[3]+' (blindaje menor)';
  var o={hit:true,zone:z[0],P:P,A:A};
  if(blast(w)&&A<60){o.pen=true;o.dmg=0.55+R()*0.45;o.txt='impacto '+where+': el blindaje ligero no resiste';return o;}
  if(P>=A){o.pen=true;o.dmg=0.6+R()*0.5;o.txt='impacto '+where+': perfora ('+P+' mm frente a ≈'+A+' mm)';return o;}
  o.pen=false;
  if(P>=A*0.6){o.dmg=0.12+R()*0.18;o.txt='impacto '+where+' sin perforar ('+P+' mm frente a ≈'+A+' mm), daños menores';return o;}
  o.dmg=blast(w)?0.08:0.02;o.txt=(w.k==='mg'||w.k==='ac'?'rebota en ':'no perfora ')+(z[0]==='frontal'?'el frente':z[3]);return o;
}
function stealthy(a){return /furtiv|stealth|sigil|baja observabilidad/i.test((a.rol||'')+' '+(a.res||'')+' '+(a.cur||[]).join(' '));}
function airShot(w,s,t){
  var acc={bvr:era(s)>1995?0.62:0.38,wvr:era(s)>1990?0.72:0.45,atgm_air:0.15,gun_air:0.32,rk_air:0.15,bomb_air:0.02,std:0.25}[w.k]||0.25;
  if(w.k==='bvr'&&rng(w)) acc*=Math.max(0.85,Math.min(1.15,0.85+rng(w)/400)); if(stealthy(t)&&w.k==='bvr') acc*=0.55; if(t.cat==='helicopteros'&&(w.k==='bvr'||w.k==='wvr')) acc*=0.9; if(s.cat==='helicopteros'&&w.k==='gun_air') acc*=0.8;
  var hit=R()<acc; if(!hit) return {hit:false,dmg:0,txt:w.k==='bvr'||w.k==='wvr'?'el misil es esquivado':'falla'};
  var d=(w.k==='gun_air'?0.3+R()*0.3:w.k==='rk_air'?0.4:0.75+R()*0.35);
  return {hit:true,pen:true,dmg:d,txt:w.k==='gun_air'?'ráfaga que impacta':'impacto del misil'};
}
function navShot(w,s,t,sub){
  var dsp=t.desp||2000, cw=CIWS.test(armTxt(t)), sm=SAM.test(armTxt(t));
  var acc={ashm:0.8,sub_ashm:0.75,ashm_weak:0.5,torp:sub?0.7:0.6,navgun:0.55,std:0.4}[w.k]||0.4;
  if((w.k==='ashm'||w.k==='sub_ashm')&&!sub){ if(cw) acc*=0.7; if(sm) acc*=0.8; }
  if(sub&&t.cat==='submarinos'&&/nuclear/i.test((t.prop||'')+' '+(t.rol||''))) acc*=0.9;
  var hit=R()<acc; if(!hit) return {hit:false,dmg:0,txt:(w.k==='ashm'&&(cw||sm))?'derribado por las defensas del buque':'falla'};
  var base={ashm:900,sub_ashm:900,ashm_weak:300,torp:2600,navgun:220,std:300}[w.k]||300;
  var d=Math.min(1.2,(base/Math.sqrt(dsp*40))*(0.7+R()*0.6));
  return {hit:true,pen:true,dmg:Math.max(0.08,d),txt:w.k==='torp'?'el torpedo impacta bajo la línea de flotación':w.k==='navgun'?'impactos de artillería':'impacto del misil'};
}
function shot(mode,w,s,t){return mode==='suelo'?groundShot(w,s,t):mode==='cielo'?airShot(w,s,t):navShot(w,s,t,mode==='sub');}
function rng(w){return w&&w.arm&&w.arm.walc?w.arm.walc:null;}
function first(mode,wa,wb,A,B){ // who fires first
  function r(w){return {bvr:9,atgm:6,ashm:9,sub_ashm:7,art:8,rk:8,torp:3,ke:4,heat:4,hesh:4,ap:4,he:4,gun:3,ac:3,mg:2,wvr:5,atgm_air:2,gun_air:1,rk_air:1,navgun:4,std:2}[w.k]||2;}
  var ra=r(wa)+(era(A)-era(B))/40+R(), rb=r(wb)+(era(B)-era(A))/40+R(); var x=rng(wa),y=rng(wb); if(x&&y&&r(wa)===r(wb)){ if(x>y*1.3) ra+=2.5; else if(y>x*1.3) rb+=2.5; } return ra>=rb?0:1;}
function simulate(mode,A,B,wa,wb,bias){
  var hp=[1,1], ev=[], u=[A,B], w=[wa,wb], turn=first(mode,wa,wb,A,B), n=0;
  ev.push({t:'start',who:turn});
  while(hp[0]>0&&hp[1]>0&&n<20){
    var s=turn, t=1-turn, res=shot(mode,w[s],u[s],u[t]);
    if(res.hit){ var b=s===0?bias:1/bias; res.dmg=Math.min(1.2,res.dmg*b); hp[t]=Math.max(0,hp[t]-res.dmg); }
    ev.push({t:'shot',s:s,res:res,hp:hp.slice()}); turn=t; n++;
  }
  var win=hp[0]===hp[1]?(bias>=1?0:1):(hp[0]>hp[1]?0:1);
  return {ev:ev,win:win,hp:hp,dead:hp[1-win]<=0};
}
// ---------- stat factors (from the fichas) ----------
function spd(a){return a.vel||(a.mach?a.mach*1060:null);}
function tech(a){return a.anio?Math.max(1,(a.anio-1905)):null;}
function firstNum(s){var m=String(s||'').replace(/\./g,'').match(/(\d+)/);return m?+m[1]:null;}
var FACT={
 cielo:[['Época / tecnología',tech,0.3,function(a){return a.anio||'—';}],['Velocidad máxima',spd,0.25,function(a){return a.vel?Math.round(a.vel).toLocaleString('es-ES')+' km/h':(a.mach?'Mach '+String(a.mach).replace('.',','):'—');}],['Empuje/peso',function(a){return a.tw||null;},0.15,function(a){return a.tw?String(a.tw).replace('.',','):'—';}],['Techo',function(a){return a.techo||null;},0.15,function(a){return a.techo?a.techo.toLocaleString('es-ES')+' m':'—';}],['Sistemas de armas',function(a){return (a.arm||[]).length||null;},0.15,function(a){return (a.arm||[]).length?(a.arm.length+' en la ficha'):'—';}]],
 suelo:[['Época / tecnología',tech,0.25,function(a){return a.anio||'—';}],['Calibre principal',function(a){return a.cal||null;},0.25,function(a){return a.cal?String(a.cal).replace('.',',')+' mm':'—';}],['Blindaje (máx. en la ficha)',function(a){return a.blind||null;},0.25,function(a){return a.blind?a.blind+' mm':'—';}],['Potencia/peso',function(a){return a.pw||a.pwc||null;},0.1,function(a){var v=a.pw||a.pwc;return v?String(v).replace('.',',')+' hp/t':'—';}],['Velocidad',function(a){return a.vel||null;},0.15,function(a){return a.vel?String(Math.round(a.vel*10)/10).replace('.',',')+' km/h':'—';}]],
 mar:[['Época / tecnología',tech,0.25,function(a){return a.anio||'—';}],['Desplazamiento',function(a){return a.desp||null;},0.3,function(a){return a.desp?a.desp.toLocaleString('es-ES')+' t':'—';}],['Velocidad',function(a){return a.kn||null;},0.15,function(a){return a.kn?String(a.kn).replace('.',',')+(window.MAT_LANG==='en'?' knots':' nudos'):'—';}],['Sistemas de armas',function(a){return (a.arm||[]).length||null;},0.3,function(a){return (a.arm||[]).length?(a.arm.length+' en la ficha'):'—';}]],
 sub:[['Época / tecnología',tech,0.35,function(a){return a.anio||'—';}],['Desplazamiento',function(a){return a.desp||null;},0.2,function(a){return a.desp?a.desp.toLocaleString('es-ES')+' t':'—';}],['Velocidad',function(a){return a.kn||null;},0.2,function(a){return a.kn?String(a.kn).replace('.',',')+(window.MAT_LANG==='en'?' knots':' nudos'):'—';}],['Sistemas de armas',function(a){return (a.arm||[]).length||null;},0.25,function(a){return (a.arm||[]).length?(a.arm.length+' en la ficha'):'—';}]]};
function factors(mode,A,B){var rows=[],sa=0,wt=0;FACT[mode].forEach(function(f){var x=f[1](A),y=f[1](B),r={n:f[0],va:f[3](A),vb:f[3](B)}; if(x!=null&&y!=null&&x+y>0){var p=x/(x+y);r.pa=p;sa+=p*f[2];wt+=f[2];} rows.push(r);}); var pa=wt?sa/wt:0.5; return {rows:rows,pa:pa,bias:Math.pow(pa/(1-pa),0.6)};}
// ---------- links to Armamento ----------
var ARMI=null;
function reEsc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
var WT={sam:['w_sam'],bvr:['w_aam'],wvr:['w_aam'],atgm:['w_atgm'],atgm_air:['w_atgm'],ashm:['w_ashm','w_cm'],sub_ashm:['w_ashm','w_cm']};
function wlink(tok,I,k){ if(!tok) return null; var t=String(tok).trim(); if(t.length<3||/^(antitanque|contracarros?|anti-?tank|ATGM|antibuque|anti-?ship)$/i.test(t)) return null;
  if(!ARMI) ARMI=I.filter(function(x){return x.cat==='armamento';});
  var r=new RegExp('(^|[^A-Za-z0-9])'+reEsc(t).replace(/[-\s]/g,'[-\\s]?')+'(?![0-9A-Za-z])','i');
  var ty=WT[k]||null; var L0=function(r){return ARMI.filter(function(x){return (!ty||ty.indexOf(x.tipo)>=0)&&(r.test(x.n)||(x.k||[]).some(function(q){return r.test(q);}));});}; var L=L0(r); if(!L.length&&/\d[A-Za-z]+$/.test(t)){var t2=t.replace(/([0-9])[A-Za-z]+$/,'$1'); L=L0(new RegExp('(^|[^A-Za-z0-9])'+reEsc(t2).replace(/[-\s]/g,'[-\\s]?')+'(?![0-9A-Za-z])','i'));}
  L.sort(function(a,b){return ((b.img?1:0)-(a.img?1:0))||(a.n.length-b.n.length);}); return L[0]||null;}

function nf(n){return Math.round(n).toLocaleString('es-ES');}

// ---------- DUELO 2D: vista cenital con puntos azul y rojo (reglas de juego, no predicción) ----------
function LGE(){return window.MAT_LANG==='en';}
function wN(n){ n=String(n||''); if(!LGE()) return n; var m=n.match(/^Misil (.+)$/); if(m) return m[1].replace(/contracarro/,'anti-tank')+' missile';
  return n.replace(/^Perforante/,'Armour-piercing').replace(/^Explosivo/,'High-explosive').replace(/\(munición genérica\)/,'(generic round)').replace(/\(perforante cinético\)/,'(kinetic penetrator)').replace(/\(carga hueca\)/,'(shaped charge)').replace(/\(cabeza aplastante\)/,'(squash head)').replace(/^Ametralladora/,'Machine gun').replace(/^Cañón automático/,'Autocannon').replace(/^Cañón principal/,'Main gun').replace(/^Cohetes/,'Rockets').replace(/^Fuego de artillería/,'Artillery fire').replace(/^Cañones\/misiles antiaéreos en tiro directo/,'AA guns/missiles in direct fire'); }
 function LL2(es,en){return LGE()?en:es;}
function mkRng(s){ s=(s>>>0)||1; return function(){ s|=0; s=s+0x6D2B79F5|0; var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
var RANGE_DEF={bvr:50,wvr:12,gun_air:1.2,atgm_air:8,rk_air:4,bomb_air:1,ke:3,heat:3,hesh:3,ap:2.5,he:3.5,gun:3,atgm:4,ac:2,mg:1,rk:8,art:12,ashm:120,sub_ashm:50,ashm_weak:25,torp:15,navgun:18,std:5};
var SPEEDP={bvr:1100,wvr:850,atgm_air:420,rk_air:700,gun_air:1000,bomb_air:250,ke:1650,heat:1100,hesh:750,ap:900,he:800,gun:900,atgm:250,ac:1100,mg:850,rk:600,art:500,ashm:290,sub_ashm:290,ashm_weak:250,torp:25,navgun:800,std:600};
var SUPERS=/Oniks|Yakhont|BrahMos|Moskit|P-800|P-700|Granit|P-500|P-270|Kh-31|YJ-12|YJ-18|Zircon|Tsirkon|3M54|Kalibr/i;
var AMMO={bvr:4,wvr:4,gun_air:8,atgm_air:8,rk_air:4,bomb_air:2,ke:20,heat:20,hesh:15,ap:20,he:20,gun:30,atgm:4,ac:30,mg:40,rk:2,art:20,ashm:8,sub_ashm:4,ashm_weak:6,torp:6,navgun:40,std:10};
var COOL={bvr:7,wvr:4,gun_air:1.3,atgm_air:6,rk_air:3,bomb_air:9,ke:7,heat:7,hesh:7,ap:7,he:7,gun:7,atgm:14,ac:1.6,mg:1.1,rk:20,art:10,ashm:14,sub_ashm:20,ashm_weak:12,torp:30,navgun:4,std:5};
var GUNK={gun_air:1,mg:1,ac:1,navgun:1};
var TSC={cielo:1,suelo:1,mar:1};
function wRange(w){var r=rng(w); return {km:r||RANGE_DEF[w.k]||5,src:r?'ficha':'est'};}
function turnRate(a){ if(a.cat==='helicopteros') return 0.45; var y=era(a); return y<1960?0.20:y<1975?0.26:y<1990?0.31:0.35; }
function cruise(a,mode){ var s=spd(a); if(mode==='cielo') return {v:Math.max(60,(s||(a.cat==='helicopteros'?260:(era(a)>1970?1800:1000)))*(a.cat==='helicopteros'?0.8:0.55)/3.6),src:s?'ficha':'est'};
  if(mode==='suelo') return {v:Math.max(3,(s||45)*0.45/3.6),src:s?'ficha':'est'}; return {v:Math.max(4,(s||55)*0.8/3.6),src:s?'ficha':'est'}; }
function ang(a){ while(a>Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; }
function D2(mode,A,B,WA,WB,seed){
  var rnd=mkRng(seed); R=rnd; var S={mode:mode,T:0,U:[],P:[],FX:[],ev:[],over:null,seed:seed,st:[{sh:0,hit:0,pen:0,dodge:0,ciws:0,zones:{}},{sh:0,hit:0,pen:0,dodge:0,ciws:0,zones:{}}],first:null,map:null};
  function log(es,en,cls){S.ev.push({t:S.T,es:es,en:en,cls:cls||''});}
  var maxR=0; [WA,WB].forEach(function(L){L.forEach(function(w){var r=wRange(w).km; if(r>maxR&&w.k!=='bomb_air') maxR=r;});});
  var W_=0,H_=0;
  if(mode==='suelo'){ W_=3200; H_=2000; var hills=[],houses=[]; for(var i=0,tries=0;hills.length<6&&tries<200;tries++){ var hh_={x:600+rnd()*2000,y:200+rnd()*1600,r:170+rnd()*200,h:5+rnd()*9}; if(hills.every(function(q){return Math.hypot(q.x-hh_.x,q.y-hh_.y)>520;})) hills.push(hh_); }
    var vx=1200+rnd()*800, vy=500+rnd()*1000; for(var j=0;j<9;j++){ var hx=vx+(rnd()-0.5)*420, hy=vy+(rnd()-0.5)*360; houses.push({x:hx,y:hy,w:30+rnd()*26,h:22+rnd()*18}); }
    S.map={w:W_,h:H_,hills:hills,houses:houses}; }
  function elev(x,y){ if(!S.map) return 0; var e=0; S.map.hills.forEach(function(h){var d2=(x-h.x)*(x-h.x)+(y-h.y)*(y-h.y); e+=h.h*Math.exp(-d2/(h.r*h.r));}); return e; }
  function inHouse(x,y,m){ m=m||0; return S.map&&S.map.houses.some(function(h){return x>h.x-h.w/2-m&&x<h.x+h.w/2+m&&y>h.y-h.h/2-m&&y<h.y+h.h/2+m;}); }
  function los(a,b){ if(mode!=='suelo') return true; var ea=elev(a.x,a.y)+3, eb=elev(b.x,b.y)+2.6, n=40; for(var k=2;k<n-1;k++){ var f=k/n, x=a.x+(b.x-a.x)*f, y=a.y+(b.y-a.y)*f; if(inHouse(x,y)) return false; if(elev(x,y)>ea+(eb-ea)*f+1.2) return false; } return true; }
  S.elev=elev; S.los=los;
  function mk(i,a,W){ var c=cruise(a,mode); return {i:i,a:a,W:W.map(function(w){var r=wRange(w);return {w:w,km:r.km,src:r.src,ammo:AMMO[w.k]||8,cd:0};}).sort(function(p,q){return q.km-p.km;}),x:0,y:0,hd:0,v:c.v,vsrc:c.src,om:mode==='cielo'?turnRate(a):mode==='suelo'?0.5:0.05,hp:1,alive:true,fl:mode==='cielo'?(era(a)>1965?24:0):0,trail:[],hull:false,spot:null,cdMove:0}; }
  var U0=mk(0,A,WA), U1=mk(1,B,WB); S.U=[U0,U1];
  if(mode==='cielo'){ var d0=Math.max(12000,Math.min(60000,maxR*1000*1.08)), off=(rnd()-0.5)*Math.min(8000,d0*0.25); U0.x=-d0/2; U0.y=off; U0.hd=0; U1.x=d0/2; U1.y=-off; U1.hd=Math.PI; }
  else if(mode==='suelo'){ U0.x=260; U0.y=300+rnd()*1400; U0.hd=0; U1.x=W_-260; U1.y=300+rnd()*1400; U1.hd=Math.PI; }
  else { var d1=Math.max(30000,Math.min(260000,maxR*1000*1.0)); U0.x=-d1/2; U0.y=(rnd()-0.5)*d1*0.2; U0.hd=0; U1.x=d1/2; U1.y=(rnd()-0.5)*d1*0.2; U1.hd=Math.PI; }
  S.d0=Math.hypot(U1.x-U0.x,U1.y-U0.y);
  log((mode==='cielo'?'Se detectan a ':mode==='suelo'?'Los dos carros toman posiciones a ':'Los dos buques se detectan a ')+fmtD(S.d0),(mode==='cielo'?'They detect each other at ':mode==='suelo'?'Both vehicles move into position at ':'Both ships detect each other at ')+fmtD(S.d0),'start');
  function dist(a,b){return Math.hypot(b.x-a.x,b.y-a.y);}
  function crestSpot(u,t){ var best=null,bs=1e9; S.map.hills.forEach(function(h){ var a0=Math.atan2(t.y-h.y,t.x-h.x); for(var k=-2;k<=2;k++){ var a1=a0+k*0.35, rr=h.r*0.55, x=h.x-Math.cos(a1)*rr*0.35+Math.cos(a1)*rr*0.2, y=h.y-Math.sin(a1)*rr*0.35+Math.sin(a1)*rr*0.2; x=h.x+Math.cos(a1)*(-rr*0.15); y=h.y+Math.sin(a1)*(-rr*0.15); if(inHouse(x,y,6)) continue; var dU=Math.hypot(x-u.x,y-u.y), dT=Math.hypot(x-t.x,y-t.y); if(dT<500||dT>2900) continue; var s=dU*0.8+Math.abs(dT-1700)*0.3+rnd()*120; if(s<bs){bs=s;best={x:x,y:y,h:h};} } }); return best; }
  function steer(u,want,dt){ var d=ang(want-u.hd), m=u.om*dt; u.hd+=Math.max(-m,Math.min(m,d)); }
  function inbound(u){ return S.P.filter(function(p){return p.tgt===u&&p.guided;}).sort(function(p,q){return dist(p,u)-dist(q,u);})[0]; }
  function fire(u,t,wo){ var w=wo.w, dd=dist(u,t); wo.ammo--; wo.cd=(COOL[w.k]||5)*(0.85+0.3*rnd()); var st=S.st[u.i]; st.sh++; if(S.first==null){ S.first=u.i; S.firstW=wo; S.firstD=dd; }
    var res; if(mode==='suelo'){ var bt=Math.atan2(u.y-t.y,u.x-t.x), rel=Math.abs(ang(bt-t.hd)), zi=t.hull?0:(rel<Math.PI/4?0:rel>Math.PI*3/4?2:1); res=gShot(w,u.a,t.a,zi,t.hull,u.moving); } else res=shot(mode,w,u.a,t.a);
    var v=SPEEDP[w.k]||600; if((w.k==='ashm'||w.k==='sub_ashm')&&SUPERS.test(w.tok||w.n||'')) v=750;
    var guided=/bvr|wvr|atgm|ashm|sub_ashm|ashm_weak|atgm_air|torp/.test(w.k);
    S.P.push({k:w.k,w:w,x:u.x,y:u.y,hd:Math.atan2(t.y-u.y,t.x-u.x),v:v,tgt:t,own:u,res:res,guided:guided,gun:!!GUNK[w.k],life:Math.max(4,dd/v*1.6+3),trail:[],tx:t.x,ty:t.y});
    var nm=w.arm?w.arm.n:w.n; log(nameOf(u)+(guided?' lanza ':' dispara ')+nm+' a '+fmtD(dd),nameOf(u)+(guided?' launches ':' fires ')+nm+' at '+fmtD(dd),u.i?'r':'b'); }
  function gShot(w,s,t,zi,hull,mov){ var acc={ke:0.78,heat:0.7,hesh:0.68,ap:0.7,he:0.72,atgm:0.82,gun:0.72,ac:0.65,mg:0.7,rk:0.5,art:0.42,std:0.6}[w.k]||0.6; if(era(s)>1985) acc+=0.08; if(hull) acc*=0.6; if(mov) acc*=era(s)>1980?0.7:0.4; if(!(R()<acc)) return {hit:false,dmg:0};
    var z=ZONES[zi], P=effPen(w,s,t), Am=zoneArm(t,z), o={hit:true,zone:z[0],P:P,A:Am,hull:hull};
    if(blast(w)&&Am<60){o.pen=true;o.dmg=0.55+R()*0.45;return o;} if(P>=Am){o.pen=true;o.dmg=0.6+R()*0.5;return o;} o.pen=false; o.dmg=P>=Am*0.6?0.12+R()*0.18:(blast(w)?0.08:0.02); return o; }
  function nameOf(u){ return u.a.n; }
  function impact(p){ var t=p.tgt, u=p.own, r=p.res, st=S.st[u.i]; if(!t.alive) return;
    if(r.hit){ st.hit++; if(r.pen||mode!=='suelo') st.pen+=r.pen?1:0; if(r.zone) st.zones[r.zone]=(st.zones[r.zone]||0)+(r.pen?1:0); t.hp=Math.max(0,t.hp-Math.min(1.2,r.dmg)); S.FX.push({k:'boom',x:t.x,y:t.y,t0:S.T,r:mode==='cielo'?160:mode==='suelo'?18:300});
      var zt=r.zone?({frontal:[' en el frente',' on the front'],lateral:[' en el lateral',' on the side'],trasera:[' en la parte trasera',' at the rear']})[r.zone]:['',''];
      if(mode==='suelo') log('Impacto'+zt[0]+(r.hull?' (en la torre: está en posición desenfilada)':'')+': '+(r.pen?'perfora ('+r.P+' mm frente a ≈'+r.A+' mm)':'no perfora ('+r.P+' mm frente a ≈'+r.A+' mm)'),'Hit'+zt[1]+(r.hull?' (turret: it is hull-down)':'')+': '+(r.pen?'penetrates ('+r.P+' mm vs ≈'+r.A+' mm)':'no penetration ('+r.P+' mm vs ≈'+r.A+' mm)'),'hit');
      else log('Impacto en '+nameOf(t)+' ('+Math.round(t.hp*100)+' % de integridad)','Hit on '+nameOf(t)+' ('+Math.round(t.hp*100)+' % integrity)','hit');
      if(t.hp<=0){ t.alive=false; log(nameOf(t)+' queda fuera de combate',nameOf(t)+' is out of action','end'); } }
    else { if(mode==='cielo'&&p.guided){ st.dodge++; log(nameOf(t)+' esquiva el misil'+(t.fl>0?' con bengalas y señuelos y un giro brusco':' con un giro brusco'),nameOf(t)+' dodges the missile'+(t.fl>0?' with flares, chaff and a hard turn':' with a hard turn'),'miss'); }
      else if(mode==='mar'&&p.guided&&/CIWS|derrib/.test(JSON.stringify(r))){ st.ciws++; log('Las defensas de '+nameOf(t)+' derriban el misil',nameOf(t)+'’s defences shoot the missile down','miss'); }
      else if(!p.gun) log('Falla','Miss','miss'); } }
  S.step=function(dt){ if(S.over) return; S.T+=dt; var a=S.U[0], b=S.U[1];
    S.U.forEach(function(u){ if(!u.alive) return; var t=S.U[1-u.i]; u.trail.push([u.x,u.y]); if(u.trail.length>(mode==='cielo'?160:60)) u.trail.shift(); u.W.forEach(function(wo){wo.cd-=dt;}); var d=dist(u,t), bt=Math.atan2(t.y-u.y,t.x-u.x);
      if(mode==='cielo'){ var m=inbound(u), want; if(m&&dist(m,u)<9000){ want=Math.atan2(m.y-u.y,m.x-u.x)+Math.PI/2*(ang(u.hd-Math.atan2(m.y-u.y,m.x-u.x))>0?1:-1); if(dist(m,u)<2500&&u.fl>0&&!m.fl){ m.fl=1; u.fl-=2; S.FX.push({k:'flare',x:u.x,y:u.y,t0:S.T,hd:u.hd}); } }
          else { var lead=Math.min(6,d/900); want=Math.atan2(t.y+Math.sin(t.hd)*t.v*lead-u.y,t.x+Math.cos(t.hd)*t.v*lead-u.x); }
          steer(u,want,dt); u.x+=Math.cos(u.hd)*u.v*dt; u.y+=Math.sin(u.hd)*u.v*dt; }
      else if(mode==='suelo'){ if(!u.spot||S.T>u.cdMove){ u.spot=crestSpot(u,t)||{x:u.x+(t.x-u.x)*0.2,y:u.y+(t.y-u.y)*0.2,h:null}; u.cdMove=S.T+40+rnd()*30; }
          var sd=Math.hypot(u.spot.x-u.x,u.spot.y-u.y); if(u.moving){ u.prog=(u.prog||0)+dt; if(u.prog>8){ u.prog=0; if(Math.hypot(u.x-(u.px||0),u.y-(u.py||0))<20){ u.spot={x:u.x+(t.x-u.x)*0.25+(rnd()-0.5)*200,y:u.y+(t.y-u.y)*0.25+(rnd()-0.5)*200,h:null}; } u.px=u.x; u.py=u.y; } } if(sd>8){ var w2=Math.atan2(u.spot.y-u.y,u.spot.x-u.x); steer(u,w2,dt); if(Math.abs(ang(w2-u.hd))<0.6){ var nx=u.x+Math.cos(u.hd)*u.v*dt, ny=u.y+Math.sin(u.hd)*u.v*dt; if(!inHouse(nx,ny,4)){u.x=nx;u.y=ny;} else u.hd+=0.8*dt; } u.hull=false; u.moving=true; }
          else { u.moving=false; steer(u,bt,dt*0.4); u.hull=!!(u.spot.h&&elev(u.x,u.y)>elev(u.x+(t.x-u.x)/d*120,u.y+(t.y-u.y)/d*120)-1.5&&elev(u.spot.h.x,u.spot.h.y)>4); } }
      else { var my=u.W.filter(function(o){return o.ammo>0;})[0], th=t.W.filter(function(o){return o.ammo>0;})[0], keep=my?my.km*1000*0.85:5000; var want2=d>keep?bt:(my&&th&&my.km>th.km*1.2?bt+Math.PI:bt+Math.PI/2); steer(u,want2,dt); u.x+=Math.cos(u.hd)*u.v*dt; u.y+=Math.sin(u.hd)*u.v*dt; }
      var canSee=los(u,t); if(mode==='suelo'){ if(canSee) u.blind=0; else if(!u.moving){ u.blind=(u.blind||0)+dt; if(u.blind>8){ u.blind=0; var fwd=Math.min(450,d*0.35), la=bt+(rnd()-0.5)*1.2, nx2=u.x+Math.cos(la)*fwd, ny2=u.y+Math.sin(la)*fwd; nx2=Math.max(60,Math.min(S.map.w-60,nx2)); ny2=Math.max(60,Math.min(S.map.h-60,ny2)); var cs2=crestSpot({x:nx2,y:ny2},t); u.spot=(cs2&&Math.hypot(cs2.x-t.x,cs2.y-t.y)<d-150)?cs2:{x:nx2,y:ny2,h:null}; u.cdMove=S.T+60; log(nameOf(u)+' no ve al rival y avanza a otra posición',nameOf(u)+' cannot see the rival and moves to a new position',u.i?'r':'b'); } } }
      if(!canSee) return; var nose=Math.abs(ang(bt-u.hd));
      for(var k=0;k<u.W.length;k++){ var wo=u.W[k], w=wo.w; if(wo.ammo<=0||wo.cd>0||d>wo.km*1000||w.k==='bomb_air') continue; if(mode==='cielo'){ if(w.k==='gun_air'&&(nose>0.18||d>1300)) continue; if(nose>0.75) continue; } if(mode==='suelo'&&u.moving&&/atgm|rk|art/.test(w.k)) continue; if(mode==='suelo'&&w.k==='mg'&&(t.a.cat==='tanques'||armour(t.a)>20)) continue;
        if(mode==='cielo'&&S.P.some(function(p){return p.own===u&&p.guided&&p.w===w;})) continue; fire(u,t,wo); if(mode==='mar'&&wo.ammo>0&&/ashm/.test(w.k)){ wo.cd=0; fire(u,t,wo); } break; } });
    S.P.forEach(function(p){ var t=p.tgt; p.life-=dt; p.trail.push([p.x,p.y]); if(p.trail.length>(p.gun?3:28)) p.trail.shift();
      if(p.guided){ var want=Math.atan2(t.y-p.y,t.x-p.x); if(!p.res.hit&&dist(p,t)<1200*(mode==='mar'?2:1)) { p.veer=p.veer||(rnd()<0.5?1:-1); want=p.hd+p.veer*0.9; if(mode==='mar'&&!p.ciwsFx){ p.ciwsFx=1; S.FX.push({k:'ciws',x:t.x,y:t.y,tx:p.x,ty:p.y,t0:S.T}); p.life=Math.min(p.life,0.6); } } var dd=ang(want-p.hd), m=(mode==='cielo'?0.9:mode==='mar'?0.4:1.5)*dt; p.hd+=Math.max(-m,Math.min(m,dd)); }
      else if(!p.aimed){ p.aimed=1; p.hd=Math.atan2(t.y-p.y,t.x-p.x)+(p.res.hit?0:(rnd()-0.5)*0.05); }
      var step=p.v*dt; var dT=dist(p,t); if(p.res.hit&&dT<=step+(mode==='cielo'?60:mode==='mar'?120:6)){ p.done=1; impact(p); return; }
      p.x+=Math.cos(p.hd)*step; p.y+=Math.sin(p.hd)*step; if(p.life<=0){ p.done=1; if(!p.res.hit) impact(p); else impact(p); } });
    S.P=S.P.filter(function(p){return !p.done;}); S.FX=S.FX.filter(function(f){return S.T-f.t0<(f.k==='flare'?3:2.2);});
    var lim=mode==='cielo'?600:mode==='suelo'?900:1800;
    if(!a.alive||!b.alive) S.over={w:a.alive?0:1,how:'ko'};
    else if(S.T>lim||(S.U.every(function(u){return u.W.every(function(o){return o.ammo<=0||o.w.k==='bomb_air';});})&&!S.P.length)) S.over={w:a.hp===b.hp?(S.first===1?1:0):(a.hp>b.hp?0:1),how:'points'};
    if(S.over&&S.over.how==='points') log('Sin munición o sin tiempo: gana por daños '+nameOf(S.U[S.over.w]),'Out of ammunition or time: '+nameOf(S.U[S.over.w])+' wins on damage','end'); };
  return S; }
function fmtD(m){ return m>=1000?(Math.round(m/100)/10).toLocaleString(LGE()?'en-GB':'es-ES')+' km':Math.round(m)+' m'; }

function D2view(cv,S){ var g=cv.getContext('2d'), W=0,H=0,dpr=1, rot=false, cam={x:0,y:0,s:1,init:false};
  function layout(){ var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); W=r.width; H=r.height; rot=H>W*1.05; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cam.init=false; }
  layout();
  var clouds=[]; var cr=mkRng(S.seed+3); for(var i=0;i<26;i++) clouds.push([ (cr()-0.5)*90000,(cr()-0.5)*60000,800+cr()*2600]);
  function fit(){ var pts=[]; S.U.forEach(function(u){ if(u.alive||S.over) pts.push([u.x,u.y]); }); S.P.forEach(function(p){pts.push([p.x,p.y]);});
    var VW=rot?H:W, VH=rot?W:H; if(S.mode==='suelo'){ var M=S.map; return {x:M.w/2,y:M.h/2,s:Math.min(VW/M.w,VH/M.h)*0.98}; }
    var x0=1e12,x1=-1e12,y0=1e12,y1=-1e12; pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    var span=Math.max(x1-x0,(y1-y0)*VW/VH,S.mode==='cielo'?4000:12000)*1.75; return {x:(x0+x1)/2,y:(y0+y1)/2,s:VW/span}; }
  function tx(x,y){ return rot?[W/2+(y-cam.y)*cam.s,H/2-(x-cam.x)*cam.s]:[W/2+(x-cam.x)*cam.s,H/2+(y-cam.y)*cam.s]; }
  function sang(a){ return rot?Math.atan2(-Math.cos(a),Math.sin(a)):a; } /* rumbo del mundo a ángulo de pantalla */
  function draw(){ var f=fit(); if(!cam.init){cam.x=f.x;cam.y=f.y;cam.s=f.s;cam.init=true;} else { var k=0.08; cam.x+=(f.x-cam.x)*k; cam.y+=(f.y-cam.y)*k; cam.s*=Math.pow(f.s/cam.s,k); }
    g.setTransform(dpr,0,0,dpr,0,0); var M=S.mode;
    if(M==='cielo'){ var gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#5f8fb8'); gr.addColorStop(1,'#86aecd'); g.fillStyle=gr; g.fillRect(0,0,W,H); clouds.forEach(function(c){var p=tx(c[0],c[1]), r=Math.max(4,c[2]*cam.s); if(p[0]<-r||p[0]>W+r||p[1]<-r||p[1]>H+r) return; var gr2=g.createRadialGradient(p[0],p[1],0,p[0],p[1],r); gr2.addColorStop(0,'rgba(255,255,255,0.32)'); gr2.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr2; g.beginPath(); g.arc(p[0],p[1],r,0,7); g.fill();}); }
    else if(M==='mar'){ g.fillStyle='#1f4f78'; g.fillRect(0,0,W,H); g.strokeStyle='rgba(255,255,255,0.07)'; g.lineWidth=1; var st=20000*cam.s; if(st>12){ var ox=((-cam.x*cam.s)%st+st)%st, oy=((-cam.y*cam.s)%st+st)%st; for(var x=ox;x<W;x+=st){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();} for(var y=oy;y<H;y+=st){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();} } }
    else { g.fillStyle='#5d6b3c'; g.fillRect(0,0,W,H); var Mm=S.map; var p0=tx(0,0), p1=tx(Mm.w,Mm.h); g.fillStyle='#6f7d46'; g.fillRect(Math.min(p0[0],p1[0]),Math.min(p0[1],p1[1]),Math.abs(p1[0]-p0[0]),Math.abs(p1[1]-p0[1]));
      Mm.hills.forEach(function(h){ var p=tx(h.x,h.y), r=h.r*1.5*cam.s; var gr3=g.createRadialGradient(p[0],p[1],0,p[0],p[1],r); gr3.addColorStop(0,'rgba(150,125,70,0.75)'); gr3.addColorStop(0.55,'rgba(130,110,60,0.35)'); gr3.addColorStop(1,'rgba(120,100,60,0)'); g.fillStyle=gr3; g.beginPath(); g.arc(p[0],p[1],r,0,7); g.fill(); g.strokeStyle='rgba(70,55,25,0.45)'; g.lineWidth=1; g.setLineDash([3,3]); g.beginPath(); g.arc(p[0],p[1],r*0.45,0,7); g.stroke(); g.setLineDash([]); });
      Mm.houses.forEach(function(h){ var p=tx(h.x,h.y), ww=Math.max(8,(rot?h.h:h.w)*cam.s), hh=Math.max(6,(rot?h.w:h.h)*cam.s); g.fillStyle='#c9c0ae'; g.fillRect(p[0]-ww/2,p[1]-hh/2,ww,hh); g.strokeStyle='#6b6255'; g.lineWidth=1; g.strokeRect(p[0]-ww/2,p[1]-hh/2,ww,hh); }); }
    // anillos de alcance (arma de más alcance con munición)
    S.U.forEach(function(u){ if(!u.alive) return; var wo=u.W.filter(function(o){return o.ammo>0&&o.w.k!=='bomb_air';})[0]; if(!wo) return; var p=tx(u.x,u.y), r=wo.km*1000*cam.s; if(r<6||r>Math.max(W,H)*3) return; g.setLineDash([5,5]); g.strokeStyle=u.i?'rgba(255,90,80,0.55)':'rgba(80,160,255,0.6)'; g.lineWidth=1.2; g.beginPath(); g.arc(p[0],p[1],r,0,7); g.stroke(); g.setLineDash([]); });
    // estelas y unidades
    S.U.forEach(function(u){ var col=u.i?'#ff3b30':'#2f8cff'; if(u.trail.length>1){ g.strokeStyle=u.i?'rgba(255,59,48,0.35)':'rgba(47,140,255,0.4)'; g.lineWidth=2; g.beginPath(); u.trail.forEach(function(q,k){var p=tx(q[0],q[1]); if(k) g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]);}); g.stroke(); }
      var p=tx(u.x,u.y); g.fillStyle=u.alive?col:'#555'; g.beginPath(); g.arc(p[0],p[1],7,0,7); g.fill(); g.strokeStyle='#fff'; g.lineWidth=2; var sh=sang(u.hd); g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(p[0]+Math.cos(sh)*14,p[1]+Math.sin(sh)*14); g.stroke();
      if(u.hull&&u.alive){ g.strokeStyle='rgba(255,255,255,0.8)'; g.lineWidth=2; g.beginPath(); var q2=tx(S.U[1-u.i].x,S.U[1-u.i].y), bt=Math.atan2(q2[1]-p[1],q2[0]-p[0]); g.arc(p[0],p[1],11,bt-0.9,bt+0.9); g.stroke(); } });
    // proyectiles
    S.P.forEach(function(q){ var p=tx(q.x,q.y); if(q.gun){ var b=tx(q.x-Math.cos(q.hd)*Math.max(30,q.v*0.06),q.y-Math.sin(q.hd)*Math.max(30,q.v*0.06)); g.strokeStyle='rgba(255,220,120,0.95)'; g.lineWidth=2; g.beginPath(); g.moveTo(b[0],b[1]); g.lineTo(p[0],p[1]); g.stroke(); return; }
      if(q.trail.length>1){ g.strokeStyle='rgba(255,255,255,0.55)'; g.lineWidth=1.5; g.beginPath(); q.trail.forEach(function(r,k){var pp=tx(r[0],r[1]); if(k) g.lineTo(pp[0],pp[1]); else g.moveTo(pp[0],pp[1]);}); g.stroke(); }
      g.fillStyle=q.own.i?'#ffb0a8':'#bfe0ff'; g.beginPath(); g.arc(p[0],p[1],3.2,0,7); g.fill(); g.strokeStyle='#ffd27a'; g.lineWidth=1; g.stroke(); });
    S.FX.forEach(function(f){ var age=S.T-f.t0, p=tx(f.x,f.y);
      if(f.k==='boom'){ var r=Math.max(8,f.r*cam.s)*(0.4+age*0.6); g.fillStyle='rgba(255,170,60,'+Math.max(0,0.8-age*0.4)+')'; g.beginPath(); g.arc(p[0],p[1],r,0,7); g.fill(); }
      else if(f.k==='flare'){ for(var k=0;k<8;k++){ var a=sang(f.hd)+Math.PI+(k-3.5)*0.25, d=(6+age*40); g.fillStyle='rgba(255,240,170,'+Math.max(0,1-age/3)+')'; g.beginPath(); g.arc(p[0]+Math.cos(a)*d,p[1]+Math.sin(a)*d,2.4,0,7); g.fill(); } }
      else if(f.k==='ciws'){ var b=tx(f.tx,f.ty); g.strokeStyle='rgba(255,230,140,'+Math.max(0,1-age)+')'; g.lineWidth=1.5; for(var k2=0;k2<4;k2++){ g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(b[0]+(k2-1.5)*4,b[1]+(k2-1.5)*3); g.stroke(); } } });
    // etiquetas
    g.font='600 11px system-ui,sans-serif'; g.textAlign='center';
    S.U.forEach(function(u){ var p=tx(u.x,u.y); var nm=u.a.n.length>18?u.a.n.slice(0,17)+'…':u.a.n; g.fillStyle='rgba(0,0,0,0.55)'; var w=Math.max(34,g.measureText(nm).width+8); var lx=Math.max(w/2+2,Math.min(W-w/2-2,p[0])); g.fillRect(lx-w/2,p[1]+10,w,15); g.fillStyle='#fff'; g.fillText(nm,lx,p[1]+21);
      g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(p[0]-16,p[1]-17,32,5); g.fillStyle=u.hp>0.6?'#5fbf4a':u.hp>0.3?'#e0b33a':'#d9493a'; g.fillRect(p[0]-15,p[1]-16,30*Math.max(0,u.hp),3); });
    // escala
    var mpx=1/cam.s, target=W*0.22*mpx, pw=Math.pow(10,Math.floor(Math.log10(target))), nice=[1,2,5,10].map(function(m){return m*pw;}).filter(function(v){return v<=target;}).pop()||pw; var bl=nice*cam.s; g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(8,H-26,bl+12,18); g.strokeStyle='#fff'; g.lineWidth=2; g.beginPath(); g.moveTo(14,H-12); g.lineTo(14+bl,H-12); g.stroke(); g.fillStyle='#fff'; g.textAlign='left'; g.font='600 10px system-ui,sans-serif'; g.fillText(fmtD(nice),16,H-15); }
  return {draw:draw,layout:layout,tx:tx}; }

var MN2={cielo:['✈️ Aire','✈️ Air'],suelo:['🛡️ Tierra','🛡️ Ground'],mar:['⚓ Mar','⚓ Sea']};
var MD2={cielo:['Aviones de combate en cielo abierto: se lanzan misiles de largo alcance, se cruzan en pasadas, dan la vuelta, se disparan con misiles de infrarrojos y con el cañón, y sueltan bengalas y chaff.','Combat aircraft in open sky: they fire long-range missiles, cross in passes, turn round, fire infrared missiles and guns, and drop flares and chaff.'],suelo:['Carros de combate y blindados armados en un terreno con colinas y casas: buscan una posición desenfilada (solo asoma la torre) y disparan.','Main battle tanks and armed armoured vehicles on ground with hills and houses: they look for a hull-down position (only the turret shows) and fire.'],mar:['Dos buques en mar abierto: se detectan por radar o con el helicóptero, se lanzan misiles antibuque, se defienden con misiles antiaéreos, CIWS y chaff, y de cerca usan el cañón.','Two warships in open sea: they detect each other by radar or helicopter, fire anti-ship missiles, defend with SAMs, CIWS and chaff, and use the gun up close.']};

// ---------- SILUETAS CENITALES (dibujo propio de M.A.T). Modelo aproximado hecho por MAT a partir de medidas oficiales ----------
/* Cada silueta: L = longitud (m), S = envergadura (m), h = contorno del lado derecho (x desde el morro, y desde el eje, en metros),
   nac = góndolas de motor [x0,x1,y,ancho], pr = hélices [x,y,diámetro], fin = derivas vistas desde arriba [x0,y0,x1,y1],
   dome = radomo [x,radio], gun = cañones laterales (lado izquierdo) [x,largo]. Planta según longitud, envergadura y forma alar oficiales. */
var SPA={
 f16:{L:15.06,S:9.96,h:[0,0,1.2,0.32,2.6,0.52,4.4,0.64,5.4,0.7,7.4,1.3,9.7,4.6,9.7,4.98,11.2,4.98,11.2,4.6,11.3,1.35,12.3,1.25,12.4,1.25,14.0,2.75,14.7,2.75,14.5,0.9,15.06,0.55,15.06,0],fin:[[10.6,0,14.9,0]],cp:[2.2,4.6,0.42]},
 f15:{L:19.43,S:13.05,h:[0,0,1.5,0.4,3.4,0.72,5.0,0.88,5.6,1.7,8.8,1.85,13.2,6.52,15.1,6.52,14.2,1.9,15.0,1.8,15.3,1.8,17.5,4.3,18.9,4.3,18.8,1.4,19.43,1.2,19.43,0],fin:[[14.4,1.75,18.6,1.95],[14.4,-1.75,18.6,-1.95]],cp:[2.6,5.2,0.5]},
 f14:{L:19.1,S:19.54,h:[0,0,1.6,0.45,3.6,0.8,5.0,1.0,6.8,2.4,9.4,3.4,11.6,9.77,13.6,9.77,12.6,3.9,14.2,3.0,15.8,3.0,18.2,4.98,19.0,4.98,18.9,1.8,19.1,1.5,19.1,0],fin:[[13.8,1.6,18.2,1.8],[13.8,-1.6,18.2,-1.8]],cp:[2.4,5.4,0.5]},
 su27:{L:21.9,S:14.7,h:[0,0,2.0,0.45,4.5,0.75,6.4,0.85,9.4,1.9,11.0,2.6,15.0,7.1,15.0,7.35,16.4,7.35,16.4,7.0,16.0,2.9,17.0,2.6,17.3,2.5,19.6,4.4,20.6,4.4,20.2,1.4,21.0,0.9,21.0,0.3,21.9,0.25,21.9,0],fin:[[15.6,2.15,20.3,2.25],[15.6,-2.15,20.3,-2.25]],cp:[3.0,5.6,0.5]},
 mig29:{L:17.32,S:11.36,h:[0,0,1.6,0.38,3.6,0.62,4.8,0.7,7.8,1.75,9.0,2.2,12.2,5.4,12.2,5.68,13.3,5.68,13.2,2.5,14.0,2.3,14.2,2.2,16.0,3.9,16.9,3.9,16.6,1.4,17.32,0.9,17.32,0],fin:[[12.6,1.9,16.5,2.1],[12.6,-1.9,16.5,-2.1]],cp:[2.4,4.6,0.45]},
 f18:{L:17.1,S:12.3,h:[0,0,1.6,0.38,3.4,0.58,4.6,0.7,7.6,1.5,9.0,2.1,11.7,5.72,11.7,6.15,13.4,6.15,13.3,5.72,12.8,2.4,13.8,2.2,14.1,2.1,15.8,3.3,16.7,3.3,16.5,1.2,17.1,0.85,17.1,0],fin:[[11.4,1.45,14.9,1.9],[11.4,-1.45,14.9,-1.9]],cp:[2.4,4.6,0.45]},
 f22:{L:18.92,S:13.56,h:[0,0,2.0,0.7,4.0,1.2,6.0,1.6,8.5,1.8,12.6,6.78,13.9,6.78,15.6,2.3,17.6,4.4,18.3,4.4,18.92,1.4,18.92,0],fin:[[13.6,1.7,17.6,2.4],[13.6,-1.7,17.6,-2.4]],cp:[2.6,5.0,0.5]},
 f35:{L:15.7,S:10.7,h:[0,0,1.8,0.6,3.6,1.1,5.4,1.5,7.2,1.75,11.0,5.35,12.1,5.35,12.9,2.3,13.3,2.0,14.6,3.4,15.4,3.4,15.3,1.0,15.7,0.6,15.7,0],fin:[[11.8,1.3,14.8,1.8],[11.8,-1.3,14.8,-1.8]],cp:[2.4,4.8,0.5]},
 rafale:{L:15.27,S:10.9,h:[0,0,1.5,0.4,3.2,0.6,4.4,0.75,6.4,2.6,7.0,2.6,6.6,1.05,7.8,1.15,13.4,5.2,13.4,5.45,14.2,5.45,14.1,1.1,15.27,0.55,15.27,0],fin:[[10.6,0,15.0,0]],cp:[2.0,4.2,0.42]},
 typhoon:{L:15.96,S:10.95,h:[0,0,1.4,0.35,2.8,0.55,3.6,0.65,5.0,2.0,5.6,2.0,5.0,0.85,6.0,1.15,7.6,1.25,14.2,5.2,14.2,5.47,15.0,5.47,14.8,1.0,15.96,0.55,15.96,0],fin:[[11.2,0,15.6,0]],cp:[1.8,4.0,0.42]},
 gripen:{L:14.1,S:8.4,h:[0,0,1.3,0.33,2.8,0.55,4.3,0.75,6.1,2.3,6.7,2.3,6.4,0.95,7.4,1.0,10.0,2.9,10.0,3.1,12.3,4.0,12.3,4.2,13.1,4.2,13.0,0.9,14.1,0.5,14.1,0],fin:[[9.8,0,13.8,0]],cp:[1.8,3.8,0.4]},
 delta:{L:14.36,S:9.13,h:[0,0,1.6,0.38,3.4,0.6,5.0,0.75,6.0,1.0,6.6,1.1,12.7,4.4,12.7,4.56,13.3,4.56,13.3,0.9,14.36,0.5,14.36,0],fin:[[9.6,0,14.2,0]],cp:[2.0,4.2,0.42]},
 mig21:{L:14.5,S:7.15,h:[0,0,0.9,0.3,2.0,0.48,5.5,0.62,6.2,0.65,10.6,3.45,10.6,3.57,11.2,3.57,11.0,0.7,12.0,0.68,13.4,1.88,14.0,1.88,13.8,0.55,14.5,0.45,14.5,0],fin:[[10.2,0,14.2,0]],cp:[2.6,4.2,0.38]},
 swept:{L:12,S:11,h:[0,0,1.0,0.45,3.0,0.62,4.2,0.66,7.2,5.3,7.4,5.5,8.5,5.5,7.0,0.66,9.8,0.5,10.0,0.45,11.0,2.2,11.6,2.2,11.5,0.3,12,0.25,12,0],fin:[[8.4,0,11.9,0]],cp:[1.8,3.6,0.4]},
 jet:{L:12.2,S:9.4,h:[0,0,1.2,0.4,3.0,0.6,4.6,0.8,5.0,0.85,5.9,4.5,5.9,4.7,7.0,4.7,7.4,0.85,10.5,0.5,10.6,0.45,11.3,2.1,11.9,2.1,11.9,0.3,12.2,0.2,12.2,0],fin:[[9.0,0,12.0,0]],cp:[1.8,4.4,0.42]},
 a10:{L:16.26,S:17.53,h:[0,0,1.0,0.5,2.5,0.8,6.6,0.85,6.8,0.9,7.4,8.4,7.6,8.76,8.9,8.76,9.8,0.9,11.0,0.75,13.5,0.6,13.8,0.6,13.8,2.87,16.1,2.87,16.1,0.5,16.26,0.3,16.26,0],nac:[[9.4,12.8,1.75,1.3]],fin:[[13.6,2.87,16.1,2.87],[13.6,-2.87,16.1,-2.87]],cp:[1.6,3.0,0.5]},
 harrier:{L:14.12,S:9.25,h:[0,0,1.4,0.35,3.0,0.6,4.4,0.7,5.0,1.4,6.6,1.5,7.0,1.5,9.4,4.4,9.6,4.63,10.8,4.63,10.0,1.5,11.6,0.8,11.9,0.7,13.0,2.1,13.6,2.1,13.5,0.5,14.12,0.3,14.12,0],fin:[[10.6,0,13.9,0]],cp:[2.0,4.2,0.42]},
 tornado:{L:16.72,S:11.0,h:[0,0,1.6,0.4,3.6,0.7,5.5,1.0,6.5,1.45,7.5,1.6,9.0,2.4,11.6,5.3,11.6,5.5,12.8,5.5,12.0,2.6,13.3,1.6,13.6,1.6,15.8,3.6,16.6,3.6,16.4,1.2,16.72,0.9,16.72,0],fin:[[11.8,0,16.4,0]],cp:[2.4,5.4,0.45]},
 c130:{L:29.8,S:40.4,h:[0,0,0.6,1.0,1.8,1.7,3.5,2.1,10.6,2.15,11.8,19.6,12.2,20.2,14.2,20.2,15.6,2.15,22.0,2.0,25.0,1.4,25.1,1.3,26.8,7.6,27.2,8.0,28.4,8.0,28.6,1.0,29.8,0.4,29.8,0],nac:[[8.6,15.8,5.2,1.25],[8.6,15.6,10.0,1.25]],pr:[[8.4,5.2,4.1],[8.4,10.0,4.1]],fin:[[22.5,0,29.6,0]],cp:[0.8,2.4,1.5]},
 tprop2:{L:24.5,S:25.8,h:[0,0,0.8,0.9,2.6,1.4,9.0,1.45,9.6,1.5,10.6,12.6,10.8,12.9,12.4,12.9,12.6,1.5,19.0,1.2,21.2,0.8,21.3,0.8,22.6,5.0,23.6,5.0,23.8,0.5,24.5,0.2,24.5,0],nac:[[7.4,13.4,4.3,1.1]],pr:[[7.2,4.3,3.9]],fin:[[18.8,0,24.4,0]],cp:[0.8,2.2,1.1]},
 b52:{L:48.5,S:56.39,h:[0,0,2.0,1.0,5.0,1.6,10,1.8,17,1.8,35.4,27.6,35.6,28.2,37.6,28.2,27.0,1.8,40,1.6,42,1.4,42.5,1.4,46.5,7.6,48.2,7.6,47.5,1.0,48.5,0.5,48.5,0],nac:[[19.0,24.6,10.5,2.8],[25.0,30.8,18.7,2.8]],fin:[[38.0,0,48.2,0]],cp:[1.6,4.0,1.2]},
 tu95:{L:46.2,S:50.1,h:[0,0,1.6,1.0,4.0,1.6,10,1.45,18.5,1.5,33.0,24.4,33.4,25.05,35.6,25.05,25.0,1.5,40,1.3,41.0,1.2,44.2,7.4,45.6,7.4,45.6,0.9,46.2,0.4,46.2,0],nac:[[14.8,26.0,8.6,1.8],[20.0,30.0,16.6,1.7]],pr:[[14.6,8.6,5.6],[15.4,8.6,5.6],[19.8,16.6,5.6],[20.6,16.6,5.6]],fin:[[36.6,0,46.0,0]],cp:[1.6,3.4,1.0]},
 b2:{L:21.0,S:52.4,h:[0,0,0.8,0.9,16.9,26.2,18.6,26.2,12.7,16.3,17.0,10.7,13.8,5.3,21.0,0.0]},
 swing:{L:54.1,S:45.0,h:[0,0,3,1.0,8,1.8,14,2.2,18,2.6,26,6.5,36,21.5,36.4,22.5,39,22.5,30,6.8,40,3.0,44,2.2,47,2.0,51,6.6,53.5,6.6,52.5,1.2,54.1,0.6,54.1,0],nac:[[27,41,3.8,2.8]],fin:[[42,0,53.8,0]],cp:[2.0,4.6,1.2]},
 piston:{L:9.5,S:11.3,h:[0,0,0.3,0.45,1.2,0.6,2.4,0.62,2.6,0.65,3.2,5.2,3.6,5.6,4.4,5.6,4.9,5.0,4.9,0.6,7.8,0.35,8.0,0.32,8.4,1.6,8.8,1.9,9.2,1.9,9.4,0.2,9.5,0.1,9.5,0],pr:[[-0.05,0,3.2]],fin:[[7.4,0,9.5,0]],cp:[2.8,4.0,0.38]},
 bomb4:{L:30,S:43,h:[0,0,1,1.1,3,1.4,8,1.45,8.4,1.5,10.6,20.8,11.0,21.5,12.4,21.5,14.6,1.5,24,0.9,25,0.8,26.6,6.4,27.0,6.8,28.2,6.8,28.8,0.5,30,0.3,30,0],nac:[[6.3,13.0,5.2,1.4],[7.2,13.0,10.0,1.3]],pr:[[6.1,5.2,4.6],[7.0,10.0,4.6]],fin:[[24.5,0,30,0]],cp:[0.6,2.4,1.0]},
 bomb2:{L:16.1,S:20.6,h:[0,0,0.6,0.7,2,0.85,5.0,0.9,5.4,0.95,6.4,10.0,6.6,10.3,7.6,10.3,8.4,0.95,13,0.6,13.4,0.55,14.2,3.1,15.4,3.2,15.9,0.3,16.1,0.2,16.1,0],nac:[[3.4,9.4,3.0,1.3]],pr:[[3.2,3.0,3.7]],fin:[[13.8,3.1,15.8,3.1],[13.8,-3.1,15.8,-3.1]],cp:[0.4,1.8,0.6]},
 ttrans:{L:46,S:45,h:[0,0,1.5,1.3,4,2.2,6,2.4,16.5,2.4,28.2,22.0,28.5,22.5,30.5,22.5,24.5,2.4,38,2.0,41,1.2,40.5,1.2,44,8.0,45.6,8.0,45.0,0.7,46,0.3,46,0],fin:[[37.5,0,45.8,0]],cp:[0.8,2.6,1.6]},
 drone:{L:11,S:20,h:[0,0,0.5,0.42,1.6,0.5,4.4,0.5,4.6,0.5,4.8,9.6,4.9,10.0,5.6,10.0,5.8,0.5,9.6,0.32,9.7,0.3,10.6,2.2,11.0,2.2,10.9,0.2,11.0,0],pr:[[11.1,0,2.0]]},
 fwing:{L:11.6,S:18.9,h:[0,0,1.0,0.8,8.6,9.2,9.6,9.45,10.4,9.2,7.8,5.0,11.6,0.0]},
 heli:{L:17.7,S:14.6,heli:1,h:[0,0,0.8,0.7,3.0,1.1,6.5,1.1,8.5,0.7,9.5,0.35,15.4,0.25,15.6,1.6,16.6,1.6,16.8,0.3,17.7,0.2,17.7,0],rot:[7.0,7.3],tr:[16.8,1.4]}
};
/* Tipos con silueta propia (nombre) y, si no, silueta de su clase. */
var SPAX=[[/AC-130/i,'c130',{gun:1}],[/\b[A-Z]{0,2}C-130|Hercules|\bL-100\b/i,'c130'],[/F-16XL/i,'delta'],[/F-16|F-21\b|KF-16|Viper/i,'f16'],[/F-15/i,'f15'],[/F-14\b|Tomcat/i,'f14'],[/Su-27|Su-30|Su-33|Su-35|Su-37|J-11|J-15|J-16|Shenyang J-1[156]/i,'su27'],[/MiG-29|MiG-35/i,'mig29'],[/F\/A-18|CF-18|EA-18|\bF-18|Hornet/i,'f18'],[/F-22|Raptor|Su-57|J-20|KAAN|KF-21|FC-31|J-35/i,'f22'],[/F-35|Lightning II/i,'f35'],[/Rafale/i,'rafale'],[/Eurofighter|Typhoon\b/i,'typhoon'],[/Gripen|J-10|Viggen/i,'gripen'],[/Mirage (?:III|5|50|2000|IV)|Kfir|Nesher|Tejas|J-7\b|F-7\b|Draken|F-102|F-106|Vulcan|Mirage IIIV/i,'delta'],[/MiG-21|Chengdu J-7/i,'mig21'],[/A-10\b|Thunderbolt II/i,'a10'],[/Harrier|AV-8/i,'harrier'],[/Tornado/i,'tornado'],[/B-52|Stratofortress|H-6\b|Tu-16\b|B-47/i,'b52'],[/Tu-95|Tu-142|Bear/i,'tu95'],[/B-2\b|Spirit|B-21|Raider/i,'b2'],[/B-1\b|B-1B|Lancer|Tu-160|Tu-22M|F-111|Su-24/i,'swing'],[/B-17|B-24|B-29|Lancaster|Halifax|Stirling|Pe-8|Liberator|Fortress|Superfortress/i,'bomb4'],[/B-25|B-26|Mitchell|Marauder|He 111|Ju 88|Do 17|Mosquito|Blenheim|Wellington|SM\.79|Ki-21|G4M|Tu-2\b|Pe-2|A-26|Beaufighter|P-38|Bf 110/i,'bomb2'],[/Su-25|Frogfoot|Su-39/i,'jet'],[/X-47|nEUROn|Taranis|Okhotnik|S-70|GJ-11|RQ-170|Sentinel|Avenger|Hongdu GJ/i,'fwing']];
function sprEng(a){ var m=String(a.motor||'').match(/(\d+)\s*[×x]/); return m?+m[1]:0; }
function sprProp(a){ return /turboh[ée]lice|turboprop|T56|AE 2100|TP400|PW1[0-9]{2}|NK-12|AI-20|AI-24|TV3|Tyne|Dart|PT6|Allison 501|T64|TPE331|CT7|PW1[0-9]{2}[A-Z]|PW127|PW150|TP400|Europrop|AE2100|H[ée]lice/i.test(String(a.motor||'')+' '+String(a.rol||'')); }
function sprPiston(a){ return /radial|pist[óo]n|cilindros|Merlin|V-1710|V-1650|DB 60|BMW 801|Wright R-|Pratt & Whitney R-|Jumo 2[01]|Hispano-Suiza 12|Bristol (?:Hercules|Pegasus|Mercury|Centaurus)|Shvetsov|Klimov M-|Mikulin AM-3/i.test(String(a.motor||'')); }
function sprOf(a){ if(a._spr) return a._spr; var n=String(a.n||''), t=a.tipo||'', y=+a.anio||1950, r=null, o={};
  if(a.cat==='helicopteros') r='heli';
  for(var i=0;!r&&i<SPAX.length;i++){ if(SPAX[i][0].test(n)){ r=SPAX[i][1]; o=SPAX[i][2]||{}; } }
  var own=!!r; var ne=sprEng(a), prop=sprProp(a), pis=sprPiston(a)||(y<1945&&!/jet|reacci[óo]n|turbo/i.test(String(a.motor||'')));
  if(!r){ if(t==='dron') r=/reacci|turbofan|turborreactor|jet/i.test(String(a.motor||''))&&!/h[ée]lice/i.test(String(a.motor||''))?'fwing':'drone';
    else if(t==='caza'||t==='ataque'||t==='entrenamiento'){ if(pis) r=(ne>=2?'bomb2':'piston'); else if(prop) r=ne>=2?'tprop2':'piston'; else if(t==='entrenamiento') r='jet'; else r=y>=1975?(ne>=2?'mig29':'f16'):(y>=1950?'swept':'jet'); }
    else if(t==='bombardero'){ if(pis) r=ne>=4?'bomb4':ne===1?'piston':'bomb2'; else if(prop) r=ne>=4?'tu95':'tprop2'; else r=y>=1970&&/supers[óo]nic|geometr[ií]a variable|variable/i.test(String(a.rol||'')+' '+String(a.res||''))?'swing':(ne&&ne<=2&&y<1970?'swept':'b52'); }
    else { if(pis) r=ne>=4?'bomb4':ne===1?'piston':'bomb2'; else if(prop) r=ne>=4?'c130':(ne===1?'piston':'tprop2'); else r=ne===1&&y<1990?'jet':'ttrans'; } }
  var sh=SPA[r], L=sh.L; if(!own&&a.mtow){ var m=+a.mtow; if(m>0) L=Math.max(sh.L*0.55,Math.min(sh.L*1.7,0.42*Math.pow(m,0.37))); }
  var nE=r==='ttrans'?(ne>=4?4:2):0; a._spr={k:r,sh:sh,L:L,f:L/sh.L,own:own,gun:!!o.gun,dome:t==='awacs'&&!own,nE:nE}; return a._spr; }
function sprPath(g,pts,k,cx,mir){ g.beginPath(); var i, n=pts.length; for(i=0;i<n;i+=2){ var x=(cx-pts[i])*k, y=pts[i+1]*k; if(i) g.lineTo(x,y); else g.moveTo(x,y); } if(mir){ for(i=n-2;i>=0;i-=2){ g.lineTo((cx-pts[i])*k,-pts[i+1]*k); } } g.closePath(); }
/* Dibuja la silueta centrada en (x,y), morro hacia el ángulo hd; px = tamaño en pantalla de la mayor dimensión. */
function drawAir(g,a,x,y,hd,col,px,dead){ var sp=sprOf(a), sh=sp.sh, f=sp.f, D=Math.max(sh.L,sh.S)*f, k=px/D*f, cx=sh.L/2;
  g.save(); g.translate(x,y); g.rotate(hd); g.lineJoin='round';
  if(sh.rot){ g.fillStyle=dead?'rgba(120,120,120,0.18)':'rgba(255,255,255,0.16)'; g.beginPath(); g.arc((cx-sh.rot[0])*k,0,sh.rot[1]*k,0,Math.PI*2); g.fill(); }
  (sh.pr||[]).forEach(function(p){ [1,-1].forEach(function(s){ if(!p[1]&&s<0) return; g.strokeStyle=dead?'rgba(150,150,150,0.4)':'rgba(255,255,255,0.55)'; g.lineWidth=Math.max(1,0.35*k); g.beginPath(); g.moveTo((cx-p[0])*k,(s*p[1]-p[2]/2)*k); g.lineTo((cx-p[0])*k,(s*p[1]+p[2]/2)*k); g.stroke(); }); });
  sprPath(g,sh.h,k,cx,true); g.fillStyle=dead?'rgba(70,70,70,0.85)':col; g.fill(); g.strokeStyle=dead?'rgba(200,200,200,0.5)':'rgba(255,255,255,0.92)'; g.lineWidth=1.1; g.stroke();
  var nac=(sh.nac||[]).slice(); if(sp.nE){ var yy=sp.nE===4?[8.5,15.2]:[7.2]; yy.forEach(function(yv){ var xl=16.5+(yv-2.4)*0.6; nac.push([xl-2.6,xl+2.4,yv,1.9]); }); }
  g.fillStyle=dead?'rgba(50,50,50,0.9)':'rgba(0,0,0,0.45)'; g.strokeStyle=dead?'rgba(150,150,150,0.4)':'rgba(255,255,255,0.45)'; g.lineWidth=0.8; nac.forEach(function(n){ [1,-1].forEach(function(s){ var x0=(cx-n[0])*k, x1=(cx-n[1])*k, w=Math.max(1.6,n[3]*k); g.beginPath(); g.rect(Math.min(x0,x1),s*n[2]*k-w/2,Math.abs(x1-x0),w); g.fill(); g.stroke(); }); });
  (sh.fin||[]).forEach(function(q){ g.strokeStyle=dead?'rgba(30,30,30,0.8)':'rgba(0,0,0,0.5)'; g.lineWidth=Math.max(1.2,0.35*k); g.beginPath(); g.moveTo((cx-q[0])*k,q[1]*k); g.lineTo((cx-q[2])*k,q[3]*k); g.stroke(); });
  if(sh.cp&&!dead){ g.fillStyle='rgba(190,225,255,0.85)'; g.beginPath(); var c0=(cx-sh.cp[0])*k, c1=(cx-sh.cp[1])*k; g.ellipse((c0+c1)/2,0,Math.abs(c0-c1)/2,Math.max(0.8,sh.cp[2]*k),0,0,Math.PI*2); g.fill(); }
  if(sp.dome){ g.fillStyle='rgba(20,20,20,0.75)'; g.strokeStyle='#fff'; g.lineWidth=1; g.beginPath(); g.arc((cx-sh.L*0.66)*k,0,4.6*k,0,Math.PI*2); g.fill(); g.stroke(); }
  if(sp.gun){ g.strokeStyle=dead?'rgba(60,60,60,0.9)':'#1b1b1b'; [[7.0,2.6,0.3],[12.2,3.0,0.35],[17.5,4.2,0.55]].forEach(function(q){ g.lineWidth=Math.max(1.2,q[2]*k*2); g.beginPath(); g.moveTo((cx-q[0])*k,-2.0*k); g.lineTo((cx-q[0])*k,-(2.0+q[1])*k); g.stroke(); }); }
  g.restore(); return px/2; }
/* Tamaño en pantalla: crece con la mayor dimensión real (F-16 ≈ 22 px, AC-130 ≈ 36 px, B-52 ≈ 46 px). */
function airPx(a){ var sp=sprOf(a), D=Math.max(sp.sh.L,sp.sh.S)*sp.f; return Math.max(18,Math.min(48,10+D*0.65)); }
/* ---- Tierra: carro, VCI, rueda 8x8, autopropulsado, antiaéreo, lanzacohetes ---- */
function gndCls(a){ var t=a.tipo||'', n=String(a.n||''); if(a.cat==='tanques'){ if(t==='t_caza'&&/StuG|Jagd|SU-\d|ISU|Hetzer|Marder|Elefant|Ferdinand|Nashorn|Archer|Kanonenjagdpanzer|Ikv/i.test(n)) return 'cas'; if(/Centauro|Rooikat|AMX-10 ?RC|B1 |Stryker MGS|ZTL|Type 16|M1128|8x8|6x6/i.test(n)) return 'wtank'; return t==='t_ligero'||t==='t_caza'?'ltank':'mbt'; }
  if(t==='b_art') return 'spg'; if(t==='b_aa') return 'spaa'; if(t==='b_mlr') return 'mlrs'; if(t==='b_8x8'||/8x8|6x6|4x4|BTR|Piranha|Boxer|Stryker|Patria|VBCI|Freccia|Dragón|Terrex|LAV|Fuchs|Pandur|BMR|VAMTAC|Humvee|Cougar|MRAP|Rosomak|Lynx 8|Type 96/i.test(n)) return 'wheel'; if(t==='b_recon') return /BRDM|Fennek|VBL|Panhard|Ferret|Scimitar|Luchs|Fox|Saladin|Cascavel|Rooikat|Centauro/i.test(n)?'wheel':'ifv'; return 'ifv'; }
function drawGnd(g,a,x,y,hd,tur,col,px,dead){ var c=gndCls(a), L=px, Wd=px*(c==='wheel'||c==='wtank'?0.42:0.46); g.save(); g.translate(x,y); g.rotate(hd); g.lineJoin='round';
  var bc=dead?'rgba(60,60,60,0.9)':col, ln=dead?'rgba(190,190,190,0.6)':'#fff';
  if(c==='wheel'||c==='wtank'){ g.fillStyle='rgba(15,15,15,0.9)'; var nw=4; for(var i=0;i<nw;i++){ var xx=L*0.36-i*L*0.24; g.fillRect(xx-L*0.07,-Wd/2-1.6,L*0.14,2.2); g.fillRect(xx-L*0.07,Wd/2-0.6,L*0.14,2.2); } }
  else { g.fillStyle='rgba(20,20,20,0.9)'; g.fillRect(-L/2-0.5,-Wd/2-1.8,L+1,Math.max(3,Wd*0.26)); g.fillRect(-L/2-0.5,Wd/2+1.8-Math.max(3,Wd*0.26),L+1,Math.max(3,Wd*0.26)); }
  g.fillStyle=bc; g.strokeStyle=ln; g.lineWidth=1.2; g.beginPath(); g.moveTo(L/2,-Wd/2+(c==='wheel'||c==='ifv'?Wd*0.22:1)); g.lineTo(L/2-(c==='wheel'||c==='ifv'?L*0.12:0),-Wd/2); g.lineTo(-L/2,-Wd/2); g.lineTo(-L/2,Wd/2); g.lineTo(L/2-(c==='wheel'||c==='ifv'?L*0.12:0),Wd/2); g.lineTo(L/2,Wd/2-(c==='wheel'||c==='ifv'?Wd*0.22:1)); g.closePath(); g.fill(); g.stroke();
  if(c==='mlrs'){ g.fillStyle='rgba(0,0,0,0.4)'; g.fillRect(-L*0.45,-Wd*0.36,L*0.55,Wd*0.72); g.strokeStyle='rgba(255,255,255,0.5)'; g.lineWidth=0.8; for(var j=1;j<4;j++){ g.beginPath(); g.moveTo(-L*0.45,-Wd*0.36+j*Wd*0.18); g.lineTo(L*0.1,-Wd*0.36+j*Wd*0.18); g.stroke(); } }
  if(c==='cas'){ g.fillStyle='rgba(0,0,0,0.3)'; g.fillRect(-L*0.1,-Wd*0.36,L*0.45,Wd*0.72); g.strokeStyle=ln; g.lineWidth=2; g.beginPath(); g.moveTo(L*0.35,0); g.lineTo(L*0.85,0); g.stroke(); }
  g.restore();
  if(c==='cas'||c==='mlrs') return px/2;
  var tx_=c==='spg'?-L*0.18:(c==='ifv'||c==='wheel'?L*0.02:0), tr=c==='spg'?Wd*0.42:c==='ltank'||c==='ifv'||c==='wheel'?Wd*0.3:Wd*0.38, gl=c==='mbt'?L*0.9:c==='spg'?L*0.95:c==='wtank'?L*0.8:c==='ltank'?L*0.62:c==='spaa'?L*0.42:L*0.42;
  var px_=x+Math.cos(hd)*tx_, py_=y+Math.sin(hd)*tx_; g.save(); g.translate(px_,py_); g.rotate(tur); g.fillStyle=dead?'rgba(70,70,70,0.95)':col; g.strokeStyle=ln; g.lineWidth=1.2;
  if(c==='spg'){ g.beginPath(); g.rect(-tr,-tr*0.85,tr*1.7,tr*1.7); g.fill(); g.stroke(); } else { g.beginPath(); g.ellipse(0,0,tr*1.12,tr,0,0,Math.PI*2); g.fill(); g.stroke(); }
  g.strokeStyle=dead?'rgba(150,150,150,0.8)':'#fff'; if(c==='spaa'){ g.lineWidth=1.4; [-tr*0.5,tr*0.5].forEach(function(o){ g.beginPath(); g.moveTo(tr*0.6,o); g.lineTo(gl,o); g.stroke(); }); g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(-tr*1.2,-tr*0.7,tr*0.5,tr*1.4); }
  else { g.lineWidth=c==='mbt'||c==='spg'||c==='wtank'?2.2:1.5; g.beginPath(); g.moveTo(tr*0.7,0); g.lineTo(gl,0); g.stroke(); }
  g.restore(); return px/2; }
function gndPx(a){ var c=gndCls(a), p=+a.peso||0; var b={mbt:22,ltank:18,cas:19,wtank:20,ifv:19,wheel:19,spg:22,spaa:19,mlrs:20}[c]||19; if(p>0) b=Math.max(15,Math.min(26,b*(0.75+Math.pow(p/45,0.33)*0.25))); return b; }
/* ---- Mar: portaaviones, anfibio, buque de guerra, acorazado, patrullero, submarino ---- */
function marCls(a){ var t=a.tipo||''; if(a.cat==='submarinos') return 'sub'; if(t==='portaaviones'||/aircraft-carrier|portaaviones/i.test(String(a.id||'')+' '+String(a.rol||''))) return 'cv'; if(t==='anfibios') return /LHD|LHA|LPH|Juan Carlos|Wasp|America|Mistral|Trieste|Izumo|Hy[uū]ga|Canberra|Dokdo|Ocean|Tarawa|Iwo Jima|Anadolu/i.test(String(a.n||''))?'lhd':'amph'; if(t==='acorazados') return 'bb'; if(t==='patrulleros'||t==='minas') return 'pb'; if(t==='auxiliares'||t==='l_san_buque') return 'aux'; return 'dd'; }
function drawMar(g,a,x,y,hd,col,px,dead){ var c=marCls(a), L=px, el=+a.eslora||0, mg=+a.manga||0, r=el&&mg?Math.max(0.09,Math.min(0.26,mg/el)):({cv:0.24,lhd:0.2,amph:0.16,bb:0.15,pb:0.17,aux:0.15,sub:0.1,dd:0.12}[c]); if(c==='cv') r=Math.max(r,0.22); var Wd=Math.max(5,L*r);
  g.save(); g.translate(x,y); g.rotate(hd); g.lineJoin='round'; var bc=dead?'rgba(60,60,60,0.9)':col, ln=dead?'rgba(190,190,190,0.6)':'#fff'; g.fillStyle=bc; g.strokeStyle=ln; g.lineWidth=1.2; g.beginPath();
  if(c==='sub'){ g.ellipse(0,0,L/2,Wd/2,0,0,Math.PI*2); g.fill(); g.stroke(); g.fillStyle='rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(L*0.18,0,L*0.08,Wd*0.28,0,0,Math.PI*2); g.fill(); g.strokeStyle=ln; g.lineWidth=1; g.beginPath(); g.moveTo(-L*0.44,-Wd*0.9); g.lineTo(-L*0.44,Wd*0.9); g.stroke(); g.restore(); return px/2; }
  if(c==='cv'||c==='lhd'){ g.moveTo(L/2,-Wd*0.18); g.lineTo(L*0.38,-Wd/2); g.lineTo(-L/2,-Wd/2); g.lineTo(-L/2,Wd/2); g.lineTo(L*0.38,Wd/2); g.lineTo(L/2,Wd*0.18); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle='rgba(255,255,255,0.75)'; g.lineWidth=1; g.setLineDash([3,3]); g.beginPath(); if(c==='cv'){ g.moveTo(-L*0.46,Wd*0.05); g.lineTo(L*0.18,-Wd*0.38); } else { g.moveTo(-L*0.46,-Wd*0.1); g.lineTo(L*0.46,-Wd*0.1); } g.stroke(); g.setLineDash([]);
    g.fillStyle='rgba(0,0,0,0.55)'; g.fillRect(-L*0.02,Wd*0.26,L*0.14,Wd*0.22); g.restore(); return px/2; }
  if(c==='aux'||c==='amph'){ g.moveTo(L/2,0); g.lineTo(L*0.36,-Wd/2); g.lineTo(-L/2,-Wd/2); g.lineTo(-L/2,Wd/2); g.lineTo(L*0.36,Wd/2); g.closePath(); g.fill(); g.stroke(); g.fillStyle='rgba(0,0,0,0.4)'; g.fillRect(c==='amph'?L*0.05:-L*0.42,-Wd*0.32,L*0.22,Wd*0.64); if(c==='amph'){ g.strokeStyle='rgba(255,255,255,0.6)'; g.strokeRect(-L*0.44,-Wd*0.3,L*0.4,Wd*0.6); } g.restore(); return px/2; }
  g.moveTo(L/2,0); g.quadraticCurveTo(L*0.3,-Wd*0.55,L*0.05,-Wd/2); g.lineTo(-L*0.46,-Wd*0.44); g.lineTo(-L/2,-Wd*0.3); g.lineTo(-L/2,Wd*0.3); g.lineTo(-L*0.46,Wd*0.44); g.lineTo(L*0.05,Wd/2); g.quadraticCurveTo(L*0.3,Wd*0.55,L/2,0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle='rgba(0,0,0,0.42)'; if(c==='bb'){ g.fillRect(-L*0.1,-Wd*0.24,L*0.22,Wd*0.48); g.fillStyle='rgba(0,0,0,0.6)'; [L*0.28,L*0.17,-L*0.24].forEach(function(xx){ g.beginPath(); g.arc(xx,0,Wd*0.2,0,Math.PI*2); g.fill(); }); g.strokeStyle='rgba(255,255,255,0.8)'; g.lineWidth=1; [L*0.28,L*0.17].forEach(function(xx){ g.beginPath(); g.moveTo(xx,0); g.lineTo(xx+L*0.1,0); g.stroke(); }); g.beginPath(); g.moveTo(-L*0.24,0); g.lineTo(-L*0.34,0); g.stroke(); }
  else { g.fillRect(-L*0.06,-Wd*0.26,L*0.26,Wd*0.52); g.fillRect(-L*0.24,-Wd*0.2,L*0.12,Wd*0.4); g.fillStyle='rgba(0,0,0,0.6)'; g.beginPath(); g.arc(L*0.3,0,Wd*0.16,0,Math.PI*2); g.fill(); g.strokeStyle='rgba(255,255,255,0.8)'; g.lineWidth=1; g.beginPath(); g.moveTo(L*0.3,0); g.lineTo(L*0.39,0); g.stroke();
    if(c==='dd'&&L>18){ g.strokeStyle='rgba(255,255,255,0.55)'; g.lineWidth=0.8; g.strokeRect(-L*0.47,-Wd*0.24,L*0.16,Wd*0.48); } }
  g.restore(); return px/2; }
function marPx(a){ var el=+a.eslora||0, c=marCls(a); if(!el) el={cv:300,lhd:230,amph:150,bb:250,pb:50,aux:150,sub:90,dd:140}[c]; return Math.max(16,Math.min(46,12+el*0.085)); }

// ---------- DUELO AÉREO (vista cenital, puntos azul y rojo). Reglas de juego, no predicción ----------
/* Velocidad de los misiles (Wikipedia, ficha de cada misil). Lo que no está aquí: Mach 3, estimación. */
var MSPD=[[/AIM-54|Phoenix/i,5],[/AIM-120|AMRAAM/i,4],[/AIM-7|Sparrow/i,4],[/AIM-9|Sidewinder/i,2.5],[/R-73/i,2.5],[/R-77|RVV-AE/i,4],[/R-27/i,4.5],[/Meteor/i,4],[/MICA/i,4],[/IRIS-T/i,3],[/ASRAAM/i,3],[/Python/i,4],[/Derby/i,4],[/PL-12/i,4],[/R-60/i,2.7],[/Magic/i,2.7],[/Skyflash/i,4]];
/* Munición del cañón (Wikipedia, ficha de cada avión) y cadencia del arma. */
var GUNT=[[/F-14/i,675,6000,'M61A1 20 mm'],[/F\/A-18|CF-18|Hornet/i,578,6000,'M61A1 20 mm'],[/F-15/i,940,6000,'M61A1 20 mm'],[/F-16/i,511,6000,'M61A1 20 mm'],[/F-4\b|Phantom/i,640,6000,'M61A1 20 mm'],[/Su-27|Su-30|Su-33|Su-35|MiG-29|MiG-35/i,150,1500,'GSh-30-1 30 mm'],[/Rafale/i,125,2500,'GIAT 30 30 mm'],[/Eurofighter|Typhoon/i,150,1700,'Mauser BK-27 27 mm'],[/Gripen|Tornado/i,120,1700,'Mauser BK-27 27 mm'],[/Mirage 2000/i,250,1800,'DEFA 554 30 mm']];
var ALLASP=/R-73|Python|IRIS-T|ASRAAM|MICA|AAM-5|PL-10|AIM-9X/i;
function shortN(a){ var n=String(a.n||''); var m=n.match(/\b(?:[A-Z]{1,3}\/)?[A-Z]{1,4}-\d{1,3}[A-Z]{0,2}(?:\/[A-Z])?\b/); if(m) return m[0]; m=n.match(/Rafale|Typhoon|Gripen|Tornado|Mirage \d+|Harrier|Tomcat|Hornet/i); return m?m[0]:short(n,14); }
function airKit(a,W){
  var k={bvr:null,ir:null,gun:null}, nm=a.n||'';
  W.forEach(function(w){ var r=wRange(w), tok=(w.arm&&w.arm.n)||w.tok||w.n, sp=null;
    MSPD.forEach(function(q){ if(!sp&&q[0].test(tok)) sp=q[1]; });
    var m={w:w,n:(w.arm?w.arm.n:(w.tok||w.n)),km:r.km,src:r.src,mach:sp||3,msrc:sp?'wiki':'est',arm:w.arm||null};
    if(w.k==='bvr'&&!k.bvr){ m.left=2; m.cnt='est'; k.bvr=m; }
    else if(w.k==='wvr'&&!k.ir){ m.left=2; m.cnt='est'; m.all=ALLASP.test(tok)||era(a)>=1978; k.ir=m; }
    else if(w.k==='gun_air'&&!k.gun){ var g=null; GUNT.forEach(function(q){ if(!g&&q[0].test(nm)) g=q; }); k.gun={w:w,n:g?g[3]:w.n,rounds:g?g[1]:300,rate:g?g[2]:2000,src:g?'wiki':'est',km:0.9}; }
  });
  k.cm=era(a)>1965&&a.cat==='aviones'?{fl:30,ch:30}:(a.cat==='helicopteros'&&era(a)>1975?{fl:24,ch:0}:{fl:0,ch:0});
  return k;
}
function airTurn(a){ return turnRate(a)*(a.cat==='helicopteros'?1:1); }
function AIRsim(A,B,WA,WB,seed){
  var rnd=mkRng(seed); var S={mode:'cielo',air:true,T:0,U:[],P:[],FX:[],ev:[],over:null,seed:seed,first:null,reasons:[],pass:0,
    st:[{sh:0,hit:0,dodge:0,gunsh:0,gunhit:0,tail:0,why:{}},{sh:0,hit:0,dodge:0,gunsh:0,gunhit:0,tail:0,why:{}}]};
  function log(es,en,cls){ var L=S.ev[S.ev.length-1]; if(L&&L.es===es&&S.T-L.t<4) return; S.ev.push({t:S.T,es:es,en:en,cls:cls||''}); }
  function mk(i,a,W){ var K=airKit(a,W), vmax=spd(a)||(a.cat==='helicopteros'?280:1900);
    var heli=a.cat==='helicopteros';
    return {i:i,a:a,K:K,sn:shortN(a),x:0,y:0,hd:0,vB:Math.min(heli?vmax*0.8:300,vmax/3.6*0.95)/(heli?3.6:1),vT:heli?Math.min(60,vmax/3.6*0.6):Math.min(200,vmax/3.6*0.6),v:0,om:airTurn(a),hp:1,alive:true,fuel:1,fl:K.cm.fl,ch:K.cm.ch,cd:2+rnd()*2,gcd:0,trail:[],ab:false,def:null,bingo:false,phase:'bvr',passT:-99,lf:(K.bvr&&K.bvr.km>100?0.42:0.52)+rnd()*0.16}; }
  var a=mk(0,A,WA), b=mk(1,B,WB); S.U=[a,b];
  var maxB=Math.max(a.K.bvr?a.K.bvr.km:0,b.K.bvr?b.K.bvr.km:0);
  var D0=maxB?Math.min(80,Math.max(40,maxB*0.6))*1000:22000, lat=(rnd()<0.5?-1:1)*(rnd()<0.45?400+rnd()*900:2500+rnd()*4500);
  a.x=0; a.y=0; a.hd=(rnd()-0.5)*0.3; b.x=D0; b.y=lat; b.hd=Math.PI+(rnd()-0.5)*0.3; [a,b].forEach(function(u){ var j=0.92+rnd()*0.16; u.vB*=j; u.vT*=j; u.v=u.vB; });
  S.passKind=Math.abs(lat)<1500?'head':'beam';
  log('Vuelan al encuentro: '+a.sn+' (azul) y '+b.sn+' (rojo), separados '+fmtD(D0)+(maxB?'':' (ninguno lleva misiles de largo alcance)'),'Heading for each other: '+a.sn+' (blue) and '+b.sn+' (red), '+fmtD(D0)+' apart'+(maxB?'':' (neither carries long-range missiles)'),'');
  function dist(p,q){ return Math.hypot(q.x-p.x,q.y-p.y); }
  function brg(p,q){ return Math.atan2(q.y-p.y,q.x-p.x); }
  function steer(u,want,dt,k){ var dd=ang(want-u.hd), m=u.om*(k||1)*dt; u.hd+=Math.max(-m,Math.min(m,dd)); return Math.abs(dd); }
  function aspect(sh,tg){ return Math.abs(ang(brg(tg,sh)-tg.hd)); } /* 0 = el tirador está delante del blanco; PI = está detrás */
  function launch(u,t,m,kind){ var d=dist(u,t); m.left--; S.st[u.i].sh++; u.cd=kind==='bvr'?14+rnd()*6:7+rnd()*4;
    var v=m.mach*300, P={x:u.x,y:u.y,hd:u.hd,v:v,own:u,tgt:t,kind:kind,m:m,life:m.km*1000/v*1.15,d0:d,trail:[],aspect:aspect(u,t)};
    S.P.push(P); if(S.first==null){ S.first=u.i; S.firstD=d; S.firstW={w:{n:m.n,arm:m.arm},km:m.km,src:m.src}; }
    log(u.sn+' lanza un '+m.n+' a '+fmtD(d)+(kind==='bvr'?' (guiado por radar)':' (guiado por infrarrojos)'),u.sn+' fires an '+m.n+' at '+fmtD(d)+(kind==='bvr'?' (radar-guided)':' (infrared-guided)'),u.i?'r':'b'); }
  function gunBurst(u,t){ var g=u.K.gun, d=dist(u,t), n=Math.min(g.rounds,Math.round(g.rate/60*0.8)); if(n<=0) return; g.rounds-=n; u.gcd=1.6; S.st[u.i].gunsh++;
    var off=Math.abs(ang(brg(u,t)-u.hd)), pk=Math.max(0,0.6*(1-d/1150))*(off<0.07?1:0.6)*(t.def?0.8:1);
    S.FX.push({k:'gun',x:u.x,y:u.y,tx:t.x+(rnd()-0.5)*30,ty:t.y+(rnd()-0.5)*30,t:0,life:0.6,c:u.i});
    if(rnd()<pk){ S.st[u.i].gunhit++; t.hp-=0.45+rnd()*0.3; S.FX.push({k:'hit',x:t.x,y:t.y,t:0,life:0.8}); log(u.sn+': ráfaga de cañón a '+fmtD(d)+', impacta en el '+t.sn,u.sn+': gun burst at '+fmtD(d)+', hits the '+t.sn,u.i?'r':'b'); if(t.hp<=0) kill(t,u,'gun',d); }
    else log(u.sn+': ráfaga de cañón a '+fmtD(d)+', falla',u.sn+': gun burst at '+fmtD(d)+', misses',u.i?'r':'b'); }
  function kill(t,u,how,d){ t.hp=0; t.alive=false; S.FX.push({k:'boom',x:t.x,y:t.y,t:0,life:1.6}); S.over={w:u.i,how:'ko'}; S.kill={how:how,d:d,by:u.i};
    log(t.sn+' queda fuera de combate','The '+t.sn+' is shot down','end'); }
  function cm(u,kind){ if(kind==='bvr'){ if(u.ch>0){ u.ch-=2; S.FX.push({k:'chaff',x:u.x,y:u.y,t:0,life:3}); return true; } return false; } if(u.fl>0){ u.fl-=2; S.FX.push({k:'flare',x:u.x,y:u.y,hd:u.hd,t:0,life:2.2}); return true; } return false; }
  S.step=function(dt){ if(S.over) return; S.T+=dt;
    S.U.forEach(function(u){ var t=S.U[1-u.i]; if(!u.alive) return; var d=dist(u,t), bt=brg(u,t);
      var inc=S.P.filter(function(p){return p.tgt===u&&p.life>0;}).sort(function(p,q){return dist(p,u)-dist(q,u);})[0];
      u.cd-=dt; u.gcd-=dt; u.ab=false;
      if(u.fuel<=0.22&&!u.bingo){ u.bingo=true; log(u.sn+' llega a su reserva de combustible (bingo) y rompe el combate',u.sn+' reaches bingo fuel and disengages',u.i?'r':'b'); }
      if(inc&&dist(inc,u)<(inc.kind==='bvr'?22000:4000)){ /* defensa: notch y chaff contra radar; giro brusco y bengalas contra IR */
        var bm=brg(u,inc), opt1=bm+Math.PI/2, opt2=bm-Math.PI/2; var want=Math.abs(ang(opt1-u.hd))<Math.abs(ang(opt2-u.hd))?opt1:opt2;
        if(inc.kind!=='bvr') want=bm+(ang(want-bm)>0?1:-1)*Math.PI*0.62;
        steer(u,want,dt,1.15); u.ab=true; if(!u.def){ u.def=inc; log(u.sn+(inc.kind==='bvr'?' gira 90° para ponerse de costado al misil (notch)':' rompe con un giro cerrado'),u.sn+(inc.kind==='bvr'?' turns 90° to beam the missile (notch)':' breaks into a hard turn'),u.i?'r':'b'); }
        var dm=dist(inc,u); if(!inc.cm&&dm<(inc.kind==='bvr'?6000:2500)){ inc.cm=cm(u,inc.kind)?1:-1; if(inc.cm>0) log(u.sn+(inc.kind==='bvr'?' suelta chaff':' suelta bengalas'),u.sn+(inc.kind==='bvr'?' drops chaff':' pops flares'),u.i?'r':'b'); }
      } else { u.def=null;
        if(!t.alive){ } else if(u.bingo){ steer(u,bt+Math.PI,dt); }
        else if(d>12000){ /* fase más allá del alcance visual */
          var mine=S.P.some(function(p){return p.own===u&&p.kind==='bvr'&&p.life>0;});
          if(mine){ steer(u,bt+(u.i?-1:1)*0.8,dt); } /* crank: mantiene al rival en el radar sin ir de cara */
          else steer(u,bt+(S.passKind==='beam'?(u.i?0.12:-0.12):0),dt);
          var B_=u.K.bvr; if(B_&&B_.left>0&&u.cd<=0&&!mine&&d<=B_.km*1000*u.lf&&Math.abs(ang(bt-u.hd))<0.9) launch(u,t,B_,'bvr');
          u.phase='bvr';
        } else { /* combate cerrado: pasada y giros */
          if(u.phase==='bvr'){ u.phase='merge'; if(u.i===0) log('Combate cerrado: '+fmtD(d)+' entre los dos','Within visual range: '+fmtD(d)+' apart',''); }
          var off=Math.abs(ang(bt-u.hd)), asp=aspect(u,t);
          if(S.T-u.passT<2.5) { /* sigue recto unos segundos tras la pasada */ }
          else { var lead=Math.min(1.2,d/600)*0.25; steer(u,bt+ang(t.hd-bt)*lead*0.3,dt,1); u.ab=true; }
          var I_=u.K.ir; if(I_&&I_.left>0&&u.cd<=0&&d>=900&&d<=Math.min(I_.km,asp>2.1?8:4.5)*1000&&off<0.5&&(I_.all||asp>2.1)) launch(u,t,I_,'ir');
          var G_=u.K.gun; if(G_&&G_.rounds>0&&u.gcd<=0&&d<=G_.km*1000&&d>=150&&off<0.14) gunBurst(u,t);
          if(asp>2.3&&d<3000) S.st[u.i].tail+=dt;
        }
      }
      u.v+=((u.phase==='merge'?u.vT:u.vB)-u.v)*Math.min(1,dt*0.4);
      u.x+=Math.cos(u.hd)*u.v*dt; u.y+=Math.sin(u.hd)*u.v*dt;
      u.fuel-=dt*(u.ab?0.0042:0.0011);
      if(!u.trail.length||S.T-u.trail[u.trail.length-1][2]>0.5){ u.trail.push([u.x,u.y,S.T]); if(u.trail.length>60) u.trail.shift(); }
    });
    /* la pasada: se cruzan de frente */
    var a_=S.U[0], b_=S.U[1]; if(a_.alive&&b_.alive){ var dd=dist(a_,b_), rel=Math.abs(ang(a_.hd-b_.hd));
      var pd=S.prevD; S.prevD=dd; if(pd!=null&&pd<2500&&dd>pd&&rel>1.6&&S.T-a_.passT>6){ dd=pd; a_.passT=b_.passT=S.T; S.pass++; var alt=Math.round(150+rnd()*450), side=dd<500;
        var top=rnd()<0.5?a_:b_, other=top===a_?b_:a_;
        if(side) log('Pasada '+S.pass+': el '+top.sn+' pasa por encima del '+other.sn+', '+alt+' m más alto','Pass '+S.pass+': the '+top.sn+' flies over the '+other.sn+', '+alt+' m higher','');
        else log('Pasada '+S.pass+': se cruzan por el lateral a '+fmtD(dd)+'; los dos dan la vuelta','Pass '+S.pass+': they cross side by side '+fmtD(dd)+' apart; both turn around','');
        S.FX.push({k:'pass',x:(a_.x+b_.x)/2,y:(a_.y+b_.y)/2,t:0,life:2.5,n:S.pass}); } }
    /* misiles */
    S.P.forEach(function(p){ if(p.life<=0) return; var t=p.tgt; p.life-=dt; var bt=brg(p,t);
      var decoy=p.cm>0&&!p.dec; if(decoy){ p.dec=1; }
      var om=p.kind==='bvr'?0.55:0.9, dd=ang(bt-p.hd); p.hd+=Math.max(-om*dt,Math.min(om*dt,dd*1.6));
      var ox=p.x, oy=p.y; p.x+=Math.cos(p.hd)*p.v*dt; p.y+=Math.sin(p.hd)*p.v*dt; if(p.life<p.m.km*1000/p.v*0.3) p.v*=Math.pow(0.985,dt*20);
      if(!p.trail.length||Math.hypot(p.x-p.trail[p.trail.length-1][0],p.y-p.trail[p.trail.length-1][1])>p.v*0.25){ p.trail.push([p.x,p.y]); if(p.trail.length>40) p.trail.shift(); }
      var d=dist(p,t);
      if(t.alive&&d<p.v*dt*1.2+60){ p.life=0; var own=p.own;
        var pk=p.kind==='bvr'?Math.max(0.08,0.4-0.28*(p.d0/(p.m.km*1000))):(p.aspect>2.1?0.65:0.3);
        var why=null; var beam=Math.abs(Math.abs(ang(brg(t,p)-t.hd))-Math.PI/2)<0.45;
        if(p.kind==='bvr'&&beam){ pk*=0.6; why='notch'; } if(p.cm>0){ pk*=p.kind==='bvr'?0.55:0.45; why=p.kind==='bvr'?'chaff':'flare'; }
        if(rnd()<pk){ S.st[own.i].hit++; S.FX.push({k:'hit',x:t.x,y:t.y,t:0,life:1}); var dmg=rnd()<0.62?1:0.5; t.hp-=dmg;
          log('¡Impacto! El '+p.m.n+' alcanza al '+t.sn+(t.hp>0?' (dañado, '+Math.round(t.hp*100)+' %)':''),'Hit! The '+p.m.n+' strikes the '+t.sn+(t.hp>0?' (damaged, '+Math.round(t.hp*100)+' %)':''),own.i?'r':'b');
          if(t.hp<=0) kill(t,own,p.kind,p.d0); }
        else { S.st[own.i].dodge++; var wy=S.st[own.i].why; wy[why||'near']=(wy[why||'near']||0)+1; S.FX.push({k:'miss',x:p.x,y:p.y,t:0,life:0.8});
          log('El '+p.m.n+' falla'+(why==='chaff'?': se va tras el chaff':why==='flare'?': lo engañan las bengalas':why==='notch'?': el '+t.sn+' se le esconde de costado (notch)':' por poco'),'The '+p.m.n+' misses'+(why==='chaff'?': it goes for the chaff':why==='flare'?': decoyed by the flares':why==='notch'?': the '+t.sn+' hides side-on (notch)':' narrowly'),t.i?'r':'b'); } }
      else if(p.life<=0){ S.st[p.own.i].dodge++; S.st[p.own.i].why.energy=(S.st[p.own.i].why.energy||0)+1; log('El '+p.m.n+' del '+p.own.sn+' se queda sin energía y cae','The '+p.own.sn+'’s '+p.m.n+' runs out of energy and falls away',p.tgt.i?'r':'b'); }
    });
    S.P=S.P.filter(function(p){return p.life>0||p.trail.length&&(p.fade=(p.fade||0)+dt)<1.5;});
    S.FX.forEach(function(f){f.t+=dt;}); S.FX=S.FX.filter(function(f){return f.t<f.life;});
    var anyM=S.P.some(function(p){return p.life>0;});
    if(!S.over&&!anyM){ var nothing=S.U.every(function(u){ var K=u.K; return u.bingo||(!(K.bvr&&K.bvr.left>0)&&!(K.ir&&K.ir.left>0)&&!(K.gun&&K.gun.rounds>0)); });
      if(nothing||S.T>420){ var sc=S.U.map(function(u){return u.hp*10+S.st[u.i].tail*0.05+S.st[u.i].hit*2+u.fuel;}); var w=sc[0]>=sc[1]?0:1; S.over={w:w,how:'pts'}; log('Fin del combate sin derribo: '+(S.T>420?'se acaba el tiempo':'los dos rompen el combate'),'Fight ends with no kill: '+(S.T>420?'time is up':'both disengage'),'end'); } }
    if(S.over&&!S.reasons.length) S.reasons=airReasons(S);
  };
  S.post=function(dt){ S.FX.forEach(function(f){f.t+=dt;}); S.FX=S.FX.filter(function(f){return f.t<f.life;}); S.P.forEach(function(p){ p.life=0; p.fade=(p.fade||0)+dt; }); S.P=S.P.filter(function(p){return p.fade<1.5;}); };
  S.tsc=function(){ var a=S.U[0],b=S.U[1], dd=Math.hypot(a.x-b.x,a.y-b.y), near=S.P.some(function(p){return p.life>0&&Math.hypot(p.x-p.tgt.x,p.y-p.tgt.y)<5000;}); if(S.over) return 1.5; if(near) return 2.5; return dd>15000?8:dd>5000?4:2; };
  S.hud=function(){ return S.U.map(function(u){ var K=u.K, p=[]; if(K.bvr) p.push(K.bvr.n.replace(/ .*/,'')+' '+K.bvr.left); if(K.ir) p.push(K.ir.n.replace(/ .*/,'')+' '+K.ir.left); if(K.gun) p.push(LL2('cañón ','gun ')+K.gun.rounds); if(K.cm.fl||K.cm.ch) p.push(LL2('bengalas ','flares ')+Math.max(0,u.fl)+' · chaff '+Math.max(0,u.ch));
    return {c:u.i,n:u.sn,hp:Math.max(0,Math.round(u.hp*100)),fuel:Math.max(0,Math.round(u.fuel*100)),txt:p.join(' · ')}; }); };
  return S;
}
function whyTxt(w,en){ var N={chaff:[['se fue tras el chaff','se fueron tras el chaff'],'went for the chaff'],flare:[['engañado por bengalas','engañados por bengalas'],'decoyed by flares'],notch:[['perdido por el notch','perdidos por el notch'],'lost to the notch'],energy:[['se quedó sin energía','se quedaron sin energía'],'ran out of energy'],near:[['falló por poco','fallaron por poco'],'narrow miss'+(0)]}; return Object.keys(w).map(function(k){ var n=w[k]; return n+' '+(en?(k==='near'?(n>1?'narrow misses':'narrow miss'):N[k][1]):N[k][0][n>1?1:0]); }).join(', '); }
function airReasons(S){ var U=S.U, w=S.over.w, W_=U[w], L_=U[1-w], R_=[];
  function P(es,en){ R_.push(LL2(es,en)); }
  if(S.first!=null){ var f=U[S.first], fw=S.firstW; P(f.sn+' dispara primero, a '+fmtD(S.firstD)+', con un '+fw.w.n+' ('+fw.km.toLocaleString('es-ES')+' km de alcance '+(fw.src==='ficha'?'según su ficha':'estimado')+')',f.sn+' fires first, at '+fmtD(S.firstD)+', with '+(/^([AEIOU]|[FHLMNRSX](?=[A-Z0-9-]))/.test(fw.w.n)?'an ':'a ')+fw.w.n+' ('+fw.km.toLocaleString('en-GB')+' km range '+(fw.src==='ficha'?'from its data sheet':'estimated')+')'); }
  [0,1].forEach(function(i){ var u=U[i], s=S.st[i]; if(!s.sh&&!s.gunsh){ P(u.sn+' no llega a disparar',u.sn+' never fires'); return; }
    if(s.sh) P(u.sn+': '+s.sh+' misil'+(s.sh>1?'es':'')+', '+s.hit+' impacto'+(s.hit===1?'':'s')+(s.dodge?' ('+whyTxt(s.why,0)+')':''),u.sn+': '+s.sh+' missile'+(s.sh>1?'s':'')+', '+s.hit+' hit'+(s.hit===1?'':'s')+(s.dodge?' ('+whyTxt(s.why,1)+')':''));
    if(s.gunsh) P(u.sn+': '+s.gunsh+' ráfaga'+(s.gunsh>1?'s':'')+' de cañón, '+s.gunhit+' con impacto',u.sn+': '+s.gunsh+' gun burst'+(s.gunsh>1?'s':'')+', '+s.gunhit+' on target'); });
  var ta=U[0].om, tb=U[1].om; if(S.pass&&Math.abs(ta-tb)>0.01&&Math.max(S.st[0].tail,S.st[1].tail)>=3){ var bt=ta>tb?U[0]:U[1], wt=bt===U[0]?U[1]:U[0]; P('Tras la pasada, el '+bt.sn+' gira más ('+Math.round(bt.om*57.3)+' °/s frente a '+Math.round(wt.om*57.3)+' °/s, estimación) y se le pone a la cola '+Math.round(S.st[bt.i].tail)+' s','After the pass, the '+bt.sn+' turns tighter ('+Math.round(bt.om*57.3)+' °/s vs '+Math.round(wt.om*57.3)+' °/s, estimate) and sits on its tail for '+Math.round(S.st[bt.i].tail)+' s'); }
  if(S.kill){ var k=S.kill; P('Derribo con '+(k.how==='gun'?'el cañón a '+fmtD(k.d):k.how==='ir'?'un misil de infrarrojos lanzado a '+fmtD(k.d):'un misil guiado por radar lanzado a '+fmtD(k.d)),'Kill with '+(k.how==='gun'?'the gun at '+fmtD(k.d):k.how==='ir'?'an infrared missile fired at '+fmtD(k.d):'a radar-guided missile fired at '+fmtD(k.d))); }
  else { var wA=U[S.over?S.over.w:0], lA=U[1-wA.i], tl=function(u){return Math.round(S.st[u.i].tail);}, fu=function(u){return Math.round(u.fuel*100);}; P('Sin derribo. Gana a los puntos el '+wA.sn+': integridad '+Math.max(0,Math.round(wA.hp*100))+' % frente al '+Math.max(0,Math.round(lA.hp*100))+' % del '+lA.sn+'; a la cola del rival '+tl(wA)+' s frente a '+tl(lA)+' s; combustible '+fu(wA)+' % frente a '+fu(lA)+' %','No kill. The '+wA.sn+' wins on points: integrity '+Math.max(0,Math.round(wA.hp*100))+' % vs '+Math.max(0,Math.round(lA.hp*100))+' % for the '+lA.sn+'; on the rival’s tail '+tl(wA)+' s vs '+tl(lA)+' s; fuel '+fu(wA)+' % vs '+fu(lA)+' %'); }
  U.forEach(function(u){ if(u.bingo) P(u.sn+' rompió el combate al llegar a la reserva de combustible ('+Math.round(u.fuel*100)+' %)',u.sn+' broke off at bingo fuel ('+Math.round(u.fuel*100)+' %)'); });
  return R_; }
function AIRview(cv,S){ var g=cv.getContext('2d'), W=0,H=0,dpr=1, cam={x:0,y:0,s:1,init:false};
  function layout(){ var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  function fit(){ var xs=[],ys=[]; S.U.forEach(function(u){ xs.push(u.x); ys.push(u.y); }); S.P.forEach(function(p){ if(p.life>0){ xs.push(p.x); ys.push(p.y);} });
    var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs), y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys); var span=Math.max(x1-x0,(y1-y0)*W/H,2500);
    return {x:(x0+x1)/2,y:(y0+y1)/2,s:Math.min(W*0.72/span,H*0.72/Math.max(y1-y0,1200))}; }
  function tx(x,y){ return [W/2+(x-cam.x)*cam.s,H/2+(y-cam.y)*cam.s]; }
  function nice(m){ var c=[100,200,500,1000,2000,5000,10000,20000,50000]; for(var i=0;i<c.length;i++){ if(c[i]*cam.s>W/6) return c[i]; } return 50000; }
  function draw(){ var f=fit(); if(!cam.init){ cam.x=f.x; cam.y=f.y; cam.s=f.s; cam.init=true; } else { var k=0.06; cam.x+=(f.x-cam.x)*k; cam.y+=(f.y-cam.y)*k; cam.s*=Math.pow(f.s/cam.s,k); }
    g.setTransform(dpr,0,0,dpr,0,0); var grd=g.createLinearGradient(0,0,0,H); grd.addColorStop(0,'#0f1d2b'); grd.addColorStop(1,'#0a141e'); g.fillStyle=grd; g.fillRect(0,0,W,H);
    var gs=nice(), gx0=Math.floor((cam.x-W/2/cam.s)/gs)*gs, gy0=Math.floor((cam.y-H/2/cam.s)/gs)*gs; g.strokeStyle='rgba(120,160,190,0.09)'; g.lineWidth=1; g.beginPath();
    for(var x=gx0;x<cam.x+W/2/cam.s;x+=gs){ var p=tx(x,0); g.moveTo(p[0],0); g.lineTo(p[0],H); } for(var y=gy0;y<cam.y+H/2/cam.s;y+=gs){ var q=tx(0,y); g.moveTo(0,q[1]); g.lineTo(W,q[1]); } g.stroke();
    var COL=['#4f95ff','#ff5a4a'], COLA=['rgba(79,149,255,','rgba(255,90,74,'];
    /* anillos de alcance: discontinuo = misil de más alcance que le queda; punteado = cañón */
    S.U.forEach(function(u){ if(!u.alive) return; var K=u.K, r=K.bvr&&K.bvr.left>0?K.bvr.km:(K.ir&&K.ir.left>0?Math.min(K.ir.km,8):0); var p=tx(u.x,u.y);
      if(r){ g.setLineDash([7,6]); g.strokeStyle=COLA[u.i]+'0.45)'; g.lineWidth=1.3; g.beginPath(); g.arc(p[0],p[1],r*1000*cam.s,0,Math.PI*2); g.stroke(); }
      if(K.gun&&K.gun.rounds>0&&K.gun.km*1000*cam.s>10){ g.setLineDash([2,4]); g.strokeStyle=COLA[u.i]+'0.5)'; g.beginPath(); g.arc(p[0],p[1],K.gun.km*1000*cam.s,0,Math.PI*2); g.stroke(); }
      g.setLineDash([]); });
    /* estelas */
    S.U.forEach(function(u){ var T_=u.trail; if(T_.length<2) return; for(var i=1;i<T_.length;i++){ var p=tx(T_[i-1][0],T_[i-1][1]), q=tx(T_[i][0],T_[i][1]); g.strokeStyle=COLA[u.i]+(0.08+0.5*i/T_.length)+')'; g.lineWidth=2; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(q[0],q[1]); g.stroke(); }
      var l=tx(T_[T_.length-1][0],T_[T_.length-1][1]), c=tx(u.x,u.y); g.beginPath(); g.moveTo(l[0],l[1]); g.lineTo(c[0],c[1]); g.stroke(); });
    S.P.forEach(function(p){ var a=p.life>0?1:Math.max(0,1-(p.fade||0)/1.5); if(p.trail.length>1){ g.strokeStyle='rgba(225,230,235,'+(0.55*a)+')'; g.lineWidth=1.6; g.beginPath(); var s=tx(p.trail[0][0],p.trail[0][1]); g.moveTo(s[0],s[1]); for(var i=1;i<p.trail.length;i++){ var q=tx(p.trail[i][0],p.trail[i][1]); g.lineTo(q[0],q[1]); } if(p.life>0){ var c=tx(p.x,p.y); g.lineTo(c[0],c[1]); } g.stroke(); }
      if(p.life>0){ var c2=tx(p.x,p.y); g.fillStyle='#fff3c4'; g.beginPath(); g.arc(c2[0],c2[1],2.6,0,Math.PI*2); g.fill(); g.fillStyle=p.own.i?'#ff9a8f':'#9cc4ff'; g.beginPath(); g.arc(c2[0]-Math.cos(p.hd)*4,c2[1]-Math.sin(p.hd)*4,1.6,0,Math.PI*2); g.fill(); } });
    /* efectos */
    S.FX.forEach(function(f){ var p=tx(f.x,f.y), k=f.t/f.life;
      if(f.k==='flare'){ for(var i=0;i<6;i++){ var dx=-Math.cos(f.hd)*(10+i*9)*k*3+Math.sin(i*2.1)*8*k*3, dy=-Math.sin(f.hd)*(10+i*9)*k*3+Math.cos(i*1.7)*8*k*3; g.fillStyle='rgba(255,'+(170+i*10)+',60,'+(1-k)+')'; g.beginPath(); g.arc(p[0]+dx,p[1]+dy,2.6*(1-k*0.5),0,Math.PI*2); g.fill(); } }
      else if(f.k==='chaff'){ for(var j=0;j<14;j++){ g.fillStyle='rgba(200,210,220,'+(0.8*(1-k))+')'; g.fillRect(p[0]+Math.sin(j*12.9)*16*(0.4+k),p[1]+Math.cos(j*7.3)*16*(0.4+k),1.6,1.6); } }
      else if(f.k==='gun'){ var q=tx(f.tx,f.ty); g.strokeStyle='rgba(255,226,120,'+(1-k)+')'; g.lineWidth=1.4; g.setLineDash([5,7]); g.lineDashOffset=-f.t*60; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(q[0],q[1]); g.stroke(); g.setLineDash([]); }
      else if(f.k==='hit'||f.k==='boom'){ var R=(f.k==='boom'?34:16)*(0.3+k); g.fillStyle='rgba(255,160,60,'+(0.6*(1-k))+')'; g.beginPath(); g.arc(p[0],p[1],R,0,Math.PI*2); g.fill(); g.strokeStyle='rgba(255,230,160,'+(1-k)+')'; g.lineWidth=2; g.beginPath(); g.arc(p[0],p[1],R*1.25,0,Math.PI*2); g.stroke(); }
      else if(f.k==='miss'){ g.strokeStyle='rgba(230,230,230,'+(1-k)+')'; g.lineWidth=1.5; g.beginPath(); g.moveTo(p[0]-5,p[1]-5); g.lineTo(p[0]+5,p[1]+5); g.moveTo(p[0]+5,p[1]-5); g.lineTo(p[0]-5,p[1]+5); g.stroke(); }
      else if(f.k==='pass'){ var al=Math.min(1,(1-k)*2); g.font='700 13px system-ui,sans-serif'; g.textAlign='center'; var tw_=g.measureText(LL2('Pasada ','Pass ')+f.n).width+20; g.fillStyle='rgba(10,16,22,'+(0.75*al)+')'; g.fillRect(W/2-tw_/2,8,tw_,22); g.fillStyle='rgba(240,220,150,'+al+')'; g.fillText(LL2('Pasada ','Pass ')+f.n,W/2,24); } });
    /* aviones: punto, rumbo y nombre */
    S.U.forEach(function(u){ var p=tx(u.x,u.y); if(!u.alive){ drawAir(g,u.a,p[0],p[1],u.hd,COL[u.i],airPx(u.a),true); g.strokeStyle=COL[u.i]; g.lineWidth=2; g.beginPath(); g.moveTo(p[0]-6,p[1]-6); g.lineTo(p[0]+6,p[1]+6); g.moveTo(p[0]+6,p[1]-6); g.lineTo(p[0]-6,p[1]+6); g.stroke(); g.font='700 11px system-ui,sans-serif'; g.textAlign='center'; g.lineWidth=3; g.strokeStyle='rgba(0,0,0,0.7)'; var dl=u.sn+LL2(' (derribado)',' (shot down)'), ow=S.U[1-u.i], wp=tx(ow.x,ow.y), dy=(Math.abs(wp[0]-p[0])<90&&Math.abs(wp[1]-p[1])<40)?(wp[1]<=p[1]?p[1]+21:p[1]-13):p[1]+(u.i===0?-13:21); g.strokeText(dl,p[0],dy); g.fillStyle='#c9ced3'; g.fillText(dl,p[0],dy); return; }
      var hs=drawAir(g,u.a,p[0],p[1],u.hd,COL[u.i],airPx(u.a));
      if(u.ab){ g.fillStyle='rgba(255,190,90,0.85)'; g.beginPath(); g.arc(p[0]-Math.cos(u.hd)*(hs+2),p[1]-Math.sin(u.hd)*(hs+2),2.4,0,Math.PI*2); g.fill(); }
      g.font='700 11px system-ui,sans-serif'; var oth=S.U[1-u.i], op=tx(oth.x,oth.y), close=Math.abs(op[0]-p[0])<80&&Math.abs(op[1]-p[1])<40, lx=p[0], ly=p[1]+(u.i===0?-(hs+5):hs+14); g.textAlign='center';
      if(close){ var up=p[1]<op[1]||(p[1]===op[1]&&u.i===0); ly=up?p[1]-(hs+5):p[1]+hs+14; if(Math.abs(op[1]-p[1])<14){ g.textAlign=p[0]<=op[0]?'right':'left'; lx=p[0]+(p[0]<=op[0]?-(hs+4):hs+4); ly=p[1]+4; } }
      g.lineWidth=3; g.strokeStyle='rgba(0,0,0,0.7)'; g.strokeText(u.sn,lx,ly); g.fillStyle='#fff'; g.fillText(u.sn,lx,ly); });
    /* escala */
    var sb=nice(), sw=sb*cam.s; g.strokeStyle='rgba(230,236,240,0.85)'; g.lineWidth=2; g.beginPath(); g.moveTo(12,H-14); g.lineTo(12+sw,H-14); g.moveTo(12,H-18); g.lineTo(12,H-10); g.moveTo(12+sw,H-18); g.lineTo(12+sw,H-10); g.stroke();
    g.font='600 11px system-ui,sans-serif'; g.textAlign='left'; g.fillStyle='rgba(230,236,240,0.9)'; g.fillText(fmtD(sb),20+sw,H-10); }
  layout(); return {draw:draw,layout:layout,tx:tx}; }

// ---------- DUELO TERRESTRE: carros de combate en vista cenital. Reglas de juego, no predicción ----------
var AUTOLD=/T-64|T-72|T-80|T-90|T-14|Leclerc|K2\b|Type 90|Type 10|Type 99|ZTZ-99|Type 96|ZTZ-96|M60-2000|PT-91|Al-Khalid|Oplot/i;
function gndKit(a,W){ var main=null,atgm=null,ac=null, F=a.F||{};
  W.forEach(function(w){ if(!main&&/^(ke|heat|hesh|ap|gun)$/.test(w.k)) main=w; if(!atgm&&w.k==='atgm') atgm=w; if(!ac&&w.k==='ac') ac=w; });
  if(!main){ W.forEach(function(w){ if(!main&&w.k==='he') main=w; }); }
  var heat=W.filter(function(w){return w.k==='heat';})[0]||null;
  var auto=AUTOLD.test(a.n||''), tank=a.cat==='tanques', e=era(a);
  var ap=esN(F.arm_principal||''), cal=a.cal||null, cm, rc=/(\d{2,3}(?:[.,]\d)?)\s*mm/g; while((cm=rc.exec(ap))){ var cv=parseFloat(cm[1].replace(',','.')); if(cv>=37&&cv<=140&&(!cal||cv>cal)) cal=cv; }
  var dm=ap.match(/(\d{2,3})\s*disparos/g), ammo=dm?parseInt(dm[dm.length-1],10):(tank?40:(main?30:0)), ammosrc=dm?'ficha':'est';
  var ct=String(F.control_tiro||'')+' '+String(F.vision_nocturna||''), fcsF=/computeriz|telémetro láser|telemetro laser|digital|balístic/i.test(ct), thF=String(ct).split(/[.;]/).some(function(z){return /térmic|termic|thermal|telururo|MCT|FLIR|infrarroj/i.test(z)&&!/ametrallad|machine gun|M240|TUSK/i.test(z);});
  var fcs=fcsF||e>=1985, therm=thF||e>=1980;
  var vmax=spd(a)||(tank?60:70), af=armFig(a);
  var ac_=Object.assign({},a,{cal:cal||a.cal});
  var pm=main?(main.penmm||pen(main,ac_)):0, pmsrc=main&&main.penmm?'ficha':'est';
  var pa=atgm?(atgm.penmm||pen(atgm,a)):0, pasrc=atgm&&atgm.penmm?'ficha':'est';
  return {main:main,heat:heat,atgm:atgm,ac:ac,auto:auto,rl:auto?7.5:(tank?7:4),rlsrc:auto?'auto':'est',ammo:ammo,ammosrc:ammosrc,atg:atgm?4:0,smoke:2,cal:cal,
    therm:therm,thsrc:thF?'ficha':'est',fcs:fcs,fcssrc:fcsF?'ficha':'est',v:vmax*0.45/3.6,vmax:vmax,ke:af.ke,ce:af.ce,armsrc:af.src,ceest:af.ceest,armq:af.q,arm:af.ke,
    pm:Math.round(pm),pmsrc:pmsrc,pa:Math.round(pa),pasrc:pasrc,rng:(main&&main.k==='ke'&&fcs)?3000:2200}; }
function GNDsim(A,B,WA,WB,seed,night){
  var rnd=mkRng(seed); R=rnd; var MW=3000, MH=1900;
  var S={mode:'suelo',gnd:true,T:0,U:[],P:[],FX:[],ev:[],over:null,seed:seed,first:null,reasons:[],night:!!night,MW:MW,MH:MH,smk:[],
    st:[{sh:0,hit:0,pen:0,flank:0,hd:0,seen:null},{sh:0,hit:0,pen:0,flank:0,hd:0,seen:null}]};
  function log(es,en,cls){ var L=S.ev[S.ev.length-1]; if(L&&L.es===es&&S.T-L.t<3) return; S.ev.push({t:S.T,es:es,en:en,cls:cls||''}); }
  /* mapa: colinas, pueblos y bosques, distinto en cada semilla */
  var hills=[],houses=[],woods=[],tries=0;
  while(hills.length<7&&tries++<300){ var h={x:350+rnd()*(MW-700),y:250+rnd()*(MH-500),r:170+rnd()*170,h:7+rnd()*9}; if(hills.every(function(q){return Math.hypot(q.x-h.x,q.y-h.y)>q.r+h.r+60;})) hills.push(h); }
  for(var v=0;v<2;v++){ var cx=MW*(0.3+0.4*rnd()), cy=MH*(v?0.28+rnd()*0.15:0.57+rnd()*0.15), n=5+Math.floor(rnd()*5);
    for(var k=0;k<n;k++){ var hw=14+rnd()*10, hh=10+rnd()*7, hx=cx+(rnd()-0.5)*190, hy=cy+(rnd()-0.5)*130; if(houses.every(function(q){return Math.abs(q.x-hx)>(q.w+hw)/2+8||Math.abs(q.y-hy)>(q.h+hh)/2+8;})&&hills.every(function(q){return Math.hypot(q.x-hx,q.y-hy)>q.r*0.55;})) houses.push({x:hx,y:hy,w:hw,h:hh}); } }
  tries=0; while(woods.length<4&&tries++<200){ var wd={x:200+rnd()*(MW-400),y:150+rnd()*(MH-300),r:50+rnd()*60}; if(hills.every(function(q){return Math.hypot(q.x-wd.x,q.y-wd.y)>q.r*0.8+wd.r;})&&houses.every(function(q){return Math.hypot(q.x-wd.x,q.y-wd.y)>wd.r+40;})) { wd.trees=[]; for(var t=0;t<Math.round(wd.r/4);t++){ var aa=rnd()*6.283, rr=Math.sqrt(rnd())*wd.r; wd.trees.push([wd.x+Math.cos(aa)*rr,wd.y+Math.sin(aa)*rr,4+rnd()*4]); } woods.push(wd); } }
  S.map={hills:hills,houses:houses,woods:woods};
  function elev(x,y){ var e=0; hills.forEach(function(h){ var d=Math.hypot(x-h.x,y-h.y); if(d<h.r) e=Math.max(e,h.h*0.5*(1+Math.cos(Math.PI*d/h.r))); }); return e; }
  function inHouse(x,y,m){ m=m||0; return houses.some(function(q){return Math.abs(x-q.x)<q.w/2+m&&Math.abs(y-q.y)<q.h/2+m;}); }
  function inWood(x,y){ return woods.some(function(q){return Math.hypot(x-q.x,y-q.y)<q.r;}); }
  function los(a,b){ var ea=elev(a.x,a.y)+2.8, eb=elev(b.x,b.y)+(b.hd_?2.4:2.2), n=60; for(var i=1;i<n;i++){ var f=i/n, x=a.x+(b.x-a.x)*f, y=a.y+(b.y-a.y)*f; if(elev(x,y)>ea+(eb-ea)*f+0.3) return false; if(inHouse(x,y)) return false; if(f>0.04&&f<0.96&&inWood(x,y)) return false; if(S.smk.some(function(s){return Math.hypot(x-s.x,y-s.y)<s.r;})) return false; } return true; }
  S.elev=elev; S.los=los;
  function mk(i,a,W,x,y){ var K=gndKit(a,W); return {i:i,a:a,K:K,sn:shortN(a),x:x,y:y,hd:0,tur:0,hp:1,alive:true,rl:2+rnd()*2,state:'move',spot:null,hd_:false,seen:false,lastSeen:-99,shots:0,ammo:K.ammo,atg:K.atg,smoke:K.smoke,mob:1,trail:[],agg:rnd()}; }
  function spawn(side){ for(var k=0;k<80;k++){ var x=side?MW-200-rnd()*500:200+rnd()*500, y=side?150+rnd()*600:MH-150-rnd()*600; if(!inHouse(x,y,12)&&!inWood(x,y)) return [x,y]; } return side?[MW-300,300]:[300,MH-300]; }
  var pa=spawn(0), pb=spawn(1); var a=mk(0,A,WA,pa[0],pa[1]), b=mk(1,B,WB,pb[0],pb[1]); S.U=[a,b];
  a.hd=a.tur=Math.atan2(b.y-a.y,b.x-a.x); b.hd=b.tur=Math.atan2(a.y-b.y,a.x-b.x);
  function dist(p,q){ return Math.hypot(q.x-p.x,q.y-p.y); }
  function brg(p,q){ return Math.atan2(q.y-p.y,q.x-p.x); }
  log('Los dos carros salen de sus posiciones, a '+fmtD(dist(a,b))+' el uno del otro'+(S.night?', de noche':''),'Both tanks move off their start positions, '+fmtD(dist(a,b))+' apart'+(S.night?', at night':''),'');
  /* posiciones desenfiladas: en la cresta de una colina, del lado que mira al rival */
  function spots(u,t){ var L=[]; hills.forEach(function(h){ var b0=Math.atan2(t.y-h.y,t.x-h.x); [-0.45,0,0.45].forEach(function(o){ var x=h.x+Math.cos(b0+o)*h.r*0.5, y=h.y+Math.sin(b0+o)*h.r*0.5; if(!inHouse(x,y,10)) L.push({x:x,y:y,h:h,hd:true}); }); });
    houses.forEach(function(q){ var b0=Math.atan2(t.y-q.y,t.x-q.x); var x=q.x-Math.cos(b0)*(Math.max(q.w,q.h)/2+12)+Math.sin(b0)*(q.w/2+10)*(rnd()<0.5?1:-1), y=q.y-Math.sin(b0)*(Math.max(q.w,q.h)/2+12); if(!inHouse(x,y,6)) L.push({x:x,y:y,house:1}); });
    return L; }
  function pick(u,t,closer){ var L=spots(u,t), dT=dist(u,t), best=null, bs=1e9; L.forEach(function(s){ var dU=Math.hypot(s.x-u.x,s.y-u.y), dE=Math.hypot(s.x-t.x,s.y-t.y); if(dU<40) return; if(closer&&dE>dT-150) return; if(dE<500) return;
      var sc=dU*0.8+Math.abs(dE-(u.K.rng*0.75))*0.5+(s.hd?0:400)+rnd()*250; if(sc<bs){ bs=sc; best=s; } }); return best; }
  function hullDown(u,t){ var s=u.spot; if(!s||!s.hd||u.state!=='hold') return false; var nb=Math.atan2(u.y-s.h.y,u.x-s.h.x), bt=brg(u,t); return Math.abs(ang(bt-nb))<0.9&&dist(u,{x:s.h.x,y:s.h.y})<s.h.r*0.75; }
  function fire(u,t,kind){ var d=dist(u,t), w=kind==='atgm'?u.K.atgm:(u.K.main.k==='ke'||!u.K.heat?u.K.main:u.K.main);
    var st=S.st[u.i]; st.sh++; u.shots++; if(kind==='atgm'){ u.atg--; u.rl=12; } else { u.ammo--; u.rl=u.K.rl*(0.92+rnd()*0.16)/(u.mob<1?1.3:1); }
    if(S.first==null){ S.first=u.i; S.firstD=d; S.firstW={w:{n:w.n},km:d/1000,src:'est'}; }
    var mv=u.state==='move', tmv=t.state==='move', thd=t.hd_;
    var p=kind==='atgm'?0.82:Math.max(0.25,0.95-0.17*(d/1000)); if(!u.K.fcs) p-=0.15; if(mv) p*=u.K.fcs?0.65:0.35; if(tmv) p*=0.75; if(thd) p*=0.6; if(S.night&&!u.K.therm) p*=0.6;
    var P={x:u.x,y:u.y,own:u,tgt:t,kind:kind,w:w,t:0,d:d,v:kind==='atgm'?300:1650,hitp:p,hd:brg(u,t),trail:[]};
    S.P.push(P); S.FX.push({k:'flash',x:u.x+Math.cos(u.tur)*8,y:u.y+Math.sin(u.tur)*8,t:0,life:0.35});
    log('El '+u.sn+(kind==='atgm'?' lanza un misil '+w.n.replace(/^Misil /,'')+' a ':' dispara con el cañón ('+short(w.n.replace(/\s*\(.*$/,''),22)+') a ')+fmtD(d)+(mv?' en marcha':''),u.sn+(kind==='atgm'?' fires a '+w.n.replace(/^Misil /,'')+' missile at ':' fires its main gun ('+short(wN(w.n).replace(/\s*\(.*$/,''),22)+') at ')+fmtD(d)+(mv?' on the move':''),u.i?'r':'b'); }
  function impact(P){ var u=P.own, t=P.tgt, st=S.st[u.i]; if(!t.alive) return;
    if(rnd()>P.hitp){ S.FX.push({k:'dust',x:t.x+(rnd()-0.5)*40,y:t.y+(rnd()-0.5)*40,t:0,life:1.2}); log('El disparo del '+u.sn+' falla'+(t.hd_?': el '+t.sn+' solo asoma la torre':(t.state==='move'?': el '+t.sn+' está en movimiento':'')),u.sn+'’s shot misses'+(t.hd_?': only the '+t.sn+'’s turret shows':(t.state==='move'?': the '+t.sn+' is moving':'')),u.i?'r':'b'); return; }
    st.hit++; var rel=Math.abs(ang(brg(t,u)-t.hd)), z=t.hd_?ZONES[0]:rel<0.87?ZONES[0]:rel<2.27?ZONES[1]:ZONES[2];
    var isCE=P.kind==='atgm'||(P.w&&P.w.k==='heat'), Pm=P.kind==='atgm'?u.K.pa:u.K.pm, Am=Math.round((isCE?t.K.ce:t.K.ke)*z[2]), wh=t.hd_?LL2('en la torre','on the turret'):LL2('en '+z[3],'on the '+({frontal:'front',lateral:'side',trasera:'rear'})[z[0]]);
    if(z[0]!=='frontal') st.flank++;
    S.FX.push({k:'hit',x:t.x,y:t.y,t:0,life:0.9});
    if(Pm>=Am){ st.pen++; var kill=rnd()<0.62; t.hp-=kill?1:0.45;
      log('Impacto del '+u.sn+' '+LL2(wh,wh)+': perfora ('+Pm+' mm frente a ≈'+Am+' mm)'+(t.hp>0?'; el '+t.sn+' sigue, dañado':''),u.sn+' hits '+wh+': penetrates ('+Pm+' mm vs ≈'+Am+' mm)'+(t.hp>0?'; the '+t.sn+' fights on, damaged':''),u.i?'r':'b');
      if(t.hp<=0){ t.hp=0; t.alive=false; S.FX.push({k:'boom',x:t.x,y:t.y,t:0,life:2.5}); S.over={w:u.i,how:'ko'}; S.kill={by:u.i,d:P.d,zone:z[0],hd:t.hd_,P:Pm,A:Am,kind:P.kind}; log('El '+t.sn+' queda fuera de combate','The '+t.sn+' is knocked out','end'); }
      else { t.mob=0.6; if(t.smoke>0){ t.smoke--; S.smk.push({x:t.x+Math.cos(brg(t,u))*30,y:t.y+Math.sin(brg(t,u))*30,r:55,t:0,life:28}); log('El '+t.sn+' lanza humo y busca otra posición','The '+t.sn+' fires smoke and looks for another position',t.i?'r':'b'); } t.state='move'; t.spot=pick(t,u,false)||t.spot; } }
    else { var minor=Pm>=Am*0.6; if(minor) t.hp-=0.08;
      log('Impacto del '+u.sn+' '+wh+': no perfora ('+Pm+' mm frente a ≈'+Am+' mm)'+(minor?', daños menores':''),u.sn+' hits '+wh+': no penetration ('+Pm+' mm vs ≈'+Am+' mm)'+(minor?', minor damage':''),u.i?'r':'b');
      if(t.smoke>0&&rnd()<0.6){ t.smoke--; S.smk.push({x:t.x+Math.cos(brg(t,u))*30,y:t.y+Math.sin(brg(t,u))*30,r:55,t:0,life:28}); log('El '+t.sn+' lanza humo y cambia de posición','The '+t.sn+' fires smoke and relocates',t.i?'r':'b'); t.state='move'; t.spot=pick(t,u,false)||t.spot; } } }
  S.step=function(dt){ if(S.over) return; S.T+=dt;
    S.U.forEach(function(u){ var t=S.U[1-u.i]; if(!u.alive||!t.alive) return; var d=dist(u,t);
      var det=S.night?(u.K.therm?3000:700):3500, see=d<=det&&los(u,t)&&los(t,u);
      if(see&&!u.seen){ if(S.st[u.i].seen==null) S.st[u.i].seen={d:d,t:S.T}; log('El '+u.sn+' localiza al '+t.sn+' a '+fmtD(d)+(S.night?(u.K.therm?' con la cámara térmica':' sin térmica, ya muy cerca'):''),u.sn+' spots the '+t.sn+' at '+fmtD(d)+(S.night?(u.K.therm?' with its thermal sight':' without thermals, already very close'):''),u.i?'r':'b'); }
      if(see&&!u.seen) u.react=S.T+(u.K.fcs?1.2:2.4)+rnd()*1.4; u.seen=see; if(see) u.lastSeen=S.T;
      if(!u.spot||(u.state==='hold'&&!see&&S.T-Math.max(u.lastSeen,u.holdT||0)>18)){ var sp=pick(u,t,u.state==='hold'); if(sp){ u.spot=sp; u.state='move'; if(u.state==='move'&&S.T>3) log('El '+u.sn+' avanza hacia otra posición','The '+u.sn+' advances to another position',u.i?'r':'b'); } }
      if(u.state==='move'&&u.spot){ var bs=brg(u,u.spot), dd=Math.hypot(u.spot.x-u.x,u.spot.y-u.y); var dh=ang(bs-u.hd); u.hd+=Math.max(-0.5*dt,Math.min(0.5*dt,dh));
        var v=u.K.v*u.mob*(inWood(u.x,u.y)?0.5:1)*(Math.abs(dh)>0.6?0.4:1); var nx=u.x+Math.cos(u.hd)*v*dt, ny=u.y+Math.sin(u.hd)*v*dt; if(!inHouse(nx,ny,6)){ u.x=nx; u.y=ny; } else u.hd+=0.8*dt*(u.i?1:-1);
        if(dd<8){ u.state='hold'; u.holdT=S.T; u.hd_=false; var hdn=hullDown(u,t); if(hdn){ S.st[u.i].hd++; log('El '+u.sn+' se coloca en posición desenfilada: solo asoma la torre','The '+u.sn+' takes a hull-down position: only the turret shows',u.i?'r':'b'); } else if(u.spot.house) log('El '+u.sn+' se cubre junto a una casa','The '+u.sn+' takes cover by a house',u.i?'r':'b'); } }
      u.hd_=hullDown(u,t);
      var want=brg(u,t)+(see?0:Math.sin(S.T*0.35+u.i*2)*0.25); var dtur=ang(want-u.tur); u.tur+=Math.max(-0.7*dt,Math.min(0.7*dt,dtur));
      u.rl-=dt;
      if(see&&u.rl<=0&&S.T>=(u.react||0)&&Math.abs(ang(brg(u,t)-u.tur))<0.05){
        if(u.atg>0&&d>2400) fire(u,t,'atgm');
        else if(u.ammo>0&&u.K.main&&d<=u.K.rng&&(u.state==='hold'||u.K.fcs)) { fire(u,t,'gun'); if(u.state==='hold'&&u.shots%2===0&&rnd()<0.35+u.agg*0.3){ var sp2=pick(u,t,u.agg>0.6); if(sp2){ u.spot=sp2; u.state='move'; log('El '+u.sn+' dispara y cambia de posición','The '+u.sn+' shoots and moves to new cover',u.i?'r':'b'); } } } }
      if(!u.trail.length||Math.hypot(u.x-u.trail[u.trail.length-1][0],u.y-u.trail[u.trail.length-1][1])>15){ u.trail.push([u.x,u.y]); if(u.trail.length>80) u.trail.shift(); }
    });
    S.P.forEach(function(P){ if(P.done) return; P.t+=dt; var tt=P.tgt; var tof=P.d/P.v; var f=Math.min(1,P.t/tof); P.x=P.own.x+(tt.x-P.own.x)*f; P.y=P.own.y+(tt.y-P.own.y)*f; if(P.kind==='atgm'){ P.trail.push([P.x,P.y]); if(P.trail.length>30) P.trail.shift(); } if(f>=1){ P.done=true; P.fade=0; impact(P); } });
    S.P.forEach(function(P){ if(P.done) P.fade+=dt; }); S.P=S.P.filter(function(P){return !P.done||P.fade<0.5;});
    S.FX.forEach(function(f){f.t+=dt;}); S.FX=S.FX.filter(function(f){return f.t<f.life;}); S.smk.forEach(function(s){s.t+=dt;}); S.smk=S.smk.filter(function(s){return s.t<s.life;});
    if(!S.over&&(S.T>480||S.U.every(function(u){return u.ammo<=0&&u.atg<=0;}))){ var w=S.U[0].hp>=S.U[1].hp?0:1; if(S.U[0].hp===S.U[1].hp) w=S.st[0].hit>=S.st[1].hit?0:1; S.over={w:w,how:'pts'}; log('Fin sin carro destruido: se acaba el tiempo','No tank knocked out: time is up','end'); }
    if(S.over&&!S.reasons.length) S.reasons=gndReasons(S);
  };
  S.post=function(dt){ S.FX.forEach(function(f){f.t+=dt;}); S.FX=S.FX.filter(function(f){return f.t<f.life;}); S.P.forEach(function(P){ P.done=true; P.fade=(P.fade||0)+dt; }); S.P=S.P.filter(function(P){return P.fade<0.5;}); };
  S.tsc=function(){ var any=S.P.length||S.U.some(function(u){return u.seen;}); return S.over?1:(any?1.5:6); };
  S.hud=function(){ return S.U.map(function(u){ var p=[LL2('cañón ','gun ')+Math.max(0,u.ammo)]; if(u.K.atgm) p.push(LL2('misiles ','missiles ')+u.atg); p.push(LL2('humo ','smoke ')+u.smoke); p.push(u.hd_?LL2('desenfilado','hull-down'):(u.state==='move'?LL2('moviéndose','moving'):LL2('parado','stopped')));
    return {c:u.i,n:u.sn,hp:Math.max(0,Math.round(u.hp*100)),fuel:null,txt:p.join(' · ')}; }); };
  return S;
}
function gndReasons(S){ var U=S.U, R_=[]; function P(es,en){ R_.push(LL2(es,en)); }
  var s0=S.st[0].seen, s1=S.st[1].seen; if(s0||s1){ var f=!s1||(s0&&s0.t<=s1.t)?0:1, sd=S.st[f].seen; P('El '+U[f].sn+' localiza primero al rival, a '+fmtD(sd.d)+(S.night?(U[f].K.therm?', gracias a su cámara térmica':''):''),'The '+U[f].sn+' spots the rival first, at '+fmtD(sd.d)+(S.night&&U[f].K.therm?', thanks to its thermal sight':'')); }
  [0,1].forEach(function(i){ var u=U[i], s=S.st[i]; if(!s.sh){ P(u.sn+' no llega a disparar',u.sn+' never fires'); return; }
    P(u.sn+': '+s.sh+' disparo'+(s.sh>1?'s':'')+', '+s.hit+' impacto'+(s.hit===1?'':'s')+', '+s.pen+' perfora'+(s.pen===1?'':'n')+(s.flank?' ('+s.flank+' por el lateral o la trasera)':''),u.sn+': '+s.sh+' shot'+(s.sh>1?'s':'')+', '+s.hit+' hit'+(s.hit===1?'':'s')+', '+s.pen+' penetrat'+(s.pen===1?'es':'e')+(s.flank?' ('+s.flank+' through the side or rear)':''));
    if(s.hd) P(u.sn+' combatió '+s.hd+' vez'+(s.hd>1?'es':'')+' desde una posición desenfilada: solo asoma la torre, más difícil de alcanzar (×0,6, regla del juego)',u.sn+' fought hull-down '+s.hd+' time'+(s.hd>1?'s':'')+': only the turret shows, harder to hit (×0.6, game rule)'); });
  [0,1].forEach(function(i){ var u=U[i], o=U[1-i]; if(!(u.K.pm>0)) return; var fr=u.K.pm>=o.K.ke; P('El cañón del '+u.sn+' (≈'+nf(u.K.pm)+' mm'+(u.K.pmsrc==='ficha'?'':', estimación')+') '+(fr?'perfora':'no perfora')+' el frontal del '+o.sn+' (≈'+nf(o.K.ke)+' mm'+(o.K.armsrc==='ficha'?', ficha':', estimación')+')'+(fr?'':': necesita darle de lado o por detrás'),'The '+u.sn+'’s gun (≈'+nf(u.K.pm)+' mm'+(u.K.pmsrc==='ficha'?'':', estimate')+') '+(fr?'penetrates':'does not penetrate')+' the '+o.sn+'’s front (≈'+nf(o.K.ke)+' mm'+(o.K.armsrc==='ficha'?', data sheet':', estimate')+')'+(fr?'':': it needs a side or rear shot')); });
  if(S.night&&U[0].K.therm!==U[1].K.therm){ var th=U[0].K.therm?U[0]:U[1]; P('De noche el '+th.sn+' tiene cámara térmica y el otro no: ve a unos 3 km frente a 700 m','At night the '+th.sn+' has a thermal sight and the other does not: about 3 km of vision against 700 m'); }
  if(U[0].K.auto!==U[1].K.auto){ var au=U[0].K.auto?U[0]:U[1], ma=au===U[0]?U[1]:U[0]; P('El '+au.sn+' tiene cargador automático (unos 7,5 s por disparo) y el '+ma.sn+' cargador humano (unos 7 s): estimación','The '+au.sn+' has an autoloader (about 7.5 s per shot) and the '+ma.sn+' a human loader (about 7 s): estimate'); }
  if(S.kill){ var k=S.kill; P('Golpe decisivo a '+fmtD(k.d)+' '+(k.hd?'en la torre':'en '+({frontal:'el frente',lateral:'el lateral',trasera:'la parte trasera'})[k.zone])+': '+k.P+' mm de penetración frente a ≈'+k.A+' mm de blindaje','Decisive hit at '+fmtD(k.d)+' on the '+(k.hd?'turret':({frontal:'front',lateral:'side',trasera:'rear'})[k.zone])+': '+k.P+' mm of penetration vs ≈'+k.A+' mm of armour'); }
  else { var wG=U[S.over?S.over.w:0], lG=U[1-wG.i]; P('Ningún carro destruido. Gana a los puntos el '+wG.sn+': conserva el '+Math.max(0,Math.round(wG.hp*100))+' % de integridad frente al '+Math.max(0,Math.round(lG.hp*100))+' % del '+lG.sn,'No tank knocked out. The '+wG.sn+' wins on points: it keeps '+Math.max(0,Math.round(wG.hp*100))+' % integrity vs '+Math.max(0,Math.round(lG.hp*100))+' % for the '+lG.sn); }
  return R_; }
function GNDview(cv,S){ var g=cv.getContext('2d'), W=0,H=0,dpr=1,rot=false,sc=1,ox=0,oy=0;
  function layout(){ var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); rot=H>W*1.15;
    var mw=rot?S.MH:S.MW, mh=rot?S.MW:S.MH; sc=Math.min(W/mw,H/mh); ox=(W-mw*sc)/2; oy=(H-mh*sc)/2; }
  function tx(x,y){ return rot?[ox+y*sc,oy+(S.MW-x)*sc]:[ox+x*sc,oy+y*sc]; }
  function sa(a){ return rot?a-Math.PI/2:a; }
  var bg=null;
  function terrain(){ bg=document.createElement('canvas'); bg.width=cv.width; bg.height=cv.height; var c=bg.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
    c.fillStyle='#55633a'; c.fillRect(0,0,W,H); var p0=tx(0,0), p1=tx(S.MW,S.MH); c.fillStyle='#62703f'; c.fillRect(Math.min(p0[0],p1[0]),Math.min(p0[1],p1[1]),Math.abs(p1[0]-p0[0]),Math.abs(p1[1]-p0[1]));
    S.map.hills.forEach(function(h){ var p=tx(h.x,h.y); for(var k=4;k>=1;k--){ c.fillStyle='rgba('+(120+k*0)+','+(110-k*4)+','+(60)+','+(0.16+0.05*(4-k))+')'; c.beginPath(); c.arc(p[0],p[1],h.r*sc*k/4,0,Math.PI*2); c.fill(); }
      c.strokeStyle='rgba(60,45,25,0.35)'; c.lineWidth=1; [0.5,0.75].forEach(function(f){ c.beginPath(); c.arc(p[0],p[1],h.r*sc*f,0,Math.PI*2); c.stroke(); }); });
    S.map.woods.forEach(function(w){ var p=tx(w.x,w.y); c.fillStyle='rgba(34,58,26,0.55)'; c.beginPath(); c.arc(p[0],p[1],Math.max(6,w.r*sc*1.05),0,Math.PI*2); c.fill(); });
    (function(){ var H=S.map.houses; if(!H.length) return; var cl=[]; H.forEach(function(q){ var g0=cl.filter(function(k){return Math.hypot(k.x-q.x,k.y-q.y)<160;})[0]; if(g0){ g0.L.push(q); g0.x=(g0.x*(g0.L.length-1)+q.x)/g0.L.length; g0.y=(g0.y*(g0.L.length-1)+q.y)/g0.L.length; } else cl.push({x:q.x,y:q.y,L:[q]}); });
      cl.forEach(function(k){ var r=40; k.L.forEach(function(q){ r=Math.max(r,Math.hypot(q.x-k.x,q.y-k.y)+30); }); var p=tx(k.x,k.y); c.fillStyle='rgba(150,135,100,0.35)'; c.beginPath(); c.arc(p[0],p[1],Math.max(10,r*sc),0,Math.PI*2); c.fill(); }); })();
    S.map.woods.forEach(function(w){ w.trees.forEach(function(t){ var p=tx(t[0],t[1]); c.fillStyle='rgba(30,52,24,0.9)'; c.beginPath(); c.arc(p[0],p[1],Math.max(1.5,t[2]*sc*1.6),0,Math.PI*2); c.fill(); }); });
    S.map.houses.forEach(function(q){ var a=tx(q.x-q.w/2,q.y-q.h/2), b=tx(q.x+q.w/2,q.y+q.h/2); var x=Math.min(a[0],b[0]), y=Math.min(a[1],b[1]), w=Math.max(6,Math.abs(b[0]-a[0])), hh=Math.max(5,Math.abs(b[1]-a[1])); x-=(w-Math.abs(b[0]-a[0]))/2; y-=(hh-Math.abs(b[1]-a[1]))/2; c.fillStyle='#c9b48a'; c.fillRect(x,y,w,hh); c.strokeStyle='#6d5a3c'; c.lineWidth=1; c.strokeRect(x,y,w,hh); c.beginPath(); if(w>hh){ c.moveTo(x,y+hh/2); c.lineTo(x+w,y+hh/2); } else { c.moveTo(x+w/2,y); c.lineTo(x+w/2,y+hh); } c.stroke(); }); }
  function draw(){ if(!bg||bg.width!==cv.width) terrain(); g.setTransform(1,0,0,1,0,0); g.drawImage(bg,0,0); g.setTransform(dpr,0,0,dpr,0,0);
    var COL=['#4f95ff','#ff5a4a'], COLA=['rgba(79,149,255,','rgba(255,90,74,'];
    S.U.forEach(function(u){ if(u.trail.length<2) return; g.strokeStyle=COLA[u.i]+'0.35)'; g.lineWidth=1.5; g.setLineDash([3,4]); g.beginPath(); var s=tx(u.trail[0][0],u.trail[0][1]); g.moveTo(s[0],s[1]); u.trail.forEach(function(p){ var q=tx(p[0],p[1]); g.lineTo(q[0],q[1]); }); g.stroke(); g.setLineDash([]); });
    S.U.forEach(function(u){ if(!u.alive||u.state!=='move'||!u.spot) return; var p=tx(u.spot.x,u.spot.y); g.strokeStyle=COLA[u.i]+'0.7)'; g.lineWidth=1.2; g.beginPath(); g.arc(p[0],p[1],4,0,Math.PI*2); g.stroke(); });
    /* línea de visión cuando se ven */
    var a=S.U[0], b=S.U[1]; if(a.alive&&b.alive&&(a.seen||b.seen)){ var pa=tx(a.x,a.y), pb=tx(b.x,b.y); g.strokeStyle='rgba(255,255,255,0.18)'; g.setLineDash([2,6]); g.beginPath(); g.moveTo(pa[0],pa[1]); g.lineTo(pb[0],pb[1]); g.stroke(); g.setLineDash([]); }
    S.P.forEach(function(P){ var p=tx(P.x,P.y); if(P.kind==='atgm'){ if(P.trail.length>1){ g.strokeStyle='rgba(230,230,230,0.6)'; g.lineWidth=1.5; g.beginPath(); var s=tx(P.trail[0][0],P.trail[0][1]); g.moveTo(s[0],s[1]); P.trail.forEach(function(q){ var r=tx(q[0],q[1]); g.lineTo(r[0],r[1]); }); g.stroke(); } g.fillStyle='#fff3c4'; g.beginPath(); g.arc(p[0],p[1],2.4,0,Math.PI*2); g.fill(); }
      else { var o=tx(P.own.x,P.own.y), al=P.done?Math.max(0,1-P.fade*2):1; g.strokeStyle='rgba(255,236,150,'+al+')'; g.lineWidth=2; g.beginPath(); var fx=o[0]+(p[0]-o[0])*Math.max(0,1-60/Math.max(60,Math.hypot(p[0]-o[0],p[1]-o[1]))), fy=o[1]+(p[1]-o[1])*Math.max(0,1-60/Math.max(60,Math.hypot(p[0]-o[0],p[1]-o[1]))); g.moveTo(fx,fy); g.lineTo(p[0],p[1]); g.stroke(); } });
    S.smk.forEach(function(s){ var p=tx(s.x,s.y), k=s.t/s.life, r=s.r*sc*(0.5+Math.min(1,s.t/3)*0.6); for(var i=0;i<5;i++){ g.fillStyle='rgba(215,215,210,'+(0.32*(1-k))+')'; g.beginPath(); g.arc(p[0]+Math.sin(i*2.3)*r*0.4,p[1]+Math.cos(i*1.7)*r*0.4,r*0.7,0,Math.PI*2); g.fill(); } });
    S.FX.forEach(function(f){ var p=tx(f.x,f.y), k=f.t/f.life;
      if(f.k==='flash'){ g.fillStyle='rgba(255,220,120,'+(1-k)+')'; g.beginPath(); g.arc(p[0],p[1],7*(1-k)+2,0,Math.PI*2); g.fill(); }
      else if(f.k==='dust'){ g.fillStyle='rgba(170,150,110,'+(0.6*(1-k))+')'; g.beginPath(); g.arc(p[0],p[1],5+10*k,0,Math.PI*2); g.fill(); }
      else if(f.k==='hit'||f.k==='boom'){ var R=(f.k==='boom'?26:12)*(0.3+k); g.fillStyle='rgba(255,150,50,'+(0.65*(1-k))+')'; g.beginPath(); g.arc(p[0],p[1],R,0,Math.PI*2); g.fill(); g.strokeStyle='rgba(255,230,160,'+(1-k)+')'; g.lineWidth=2; g.beginPath(); g.arc(p[0],p[1],R*1.2,0,Math.PI*2); g.stroke(); } });
    S.U.forEach(function(u){ var p=tx(u.x,u.y), t=S.U[1-u.i];
      if(!u.alive){ drawGnd(g,u.a,p[0],p[1],sa(u.hd),sa(u.tur),COL[u.i],gndPx(u.a),true); g.strokeStyle=COL[u.i]; g.lineWidth=2; g.beginPath(); g.moveTo(p[0]-6,p[1]-6); g.lineTo(p[0]+6,p[1]+6); g.moveTo(p[0]+6,p[1]-6); g.lineTo(p[0]-6,p[1]+6); g.stroke(); }
      else { var hh=sa(u.hd), tt=sa(u.tur); drawGnd(g,u.a,p[0],p[1],hh,tt,COL[u.i],gndPx(u.a));
        if(u.hd_){ var bt=sa(Math.atan2(t.y-u.y,t.x-u.x)); g.strokeStyle='rgba(255,255,255,0.9)'; g.lineWidth=2; g.beginPath(); g.arc(p[0],p[1],11,bt-1.1,bt+1.1); g.stroke(); } }
      g.font='700 11px system-ui,sans-serif'; g.textAlign='center'; var other=tx(t.x,t.y), ly=p[1]+(u.i===0?20:-12); if(Math.abs(other[0]-p[0])<80&&Math.abs(other[1]-ly)<16) ly=p[1]+(p[1]>other[1]?20:-12);
      var lab=u.sn+(u.alive?'':LL2(' (destruido)',' (knocked out)')); g.lineWidth=3; g.strokeStyle='rgba(0,0,0,0.7)'; g.strokeText(lab,p[0],ly); g.fillStyle=u.alive?'#fff':'#d0d0d0'; g.fillText(lab,p[0],ly);
      if(u.alive){ var bw=26, by=ly+(u.i===0?4:-15); g.fillStyle='rgba(0,0,0,0.55)'; g.fillRect(p[0]-bw/2,by,bw,4); g.fillStyle=u.hp>0.6?'#7bd36b':u.hp>0.3?'#e0b33a':'#d9493a'; g.fillRect(p[0]-bw/2+0.5,by+0.5,(bw-1)*Math.max(0,u.hp),3); } });
    if(S.night){ g.fillStyle='rgba(3,8,22,0.66)'; g.fillRect(0,0,W,H); S.U.forEach(function(u){ if(!u.alive) return; var p=tx(u.x,u.y); g.fillStyle=u.i?'rgba(255,120,110,0.95)':'rgba(120,175,255,0.95)'; g.beginPath(); g.arc(p[0],p[1],3,0,Math.PI*2); g.fill(); }); }
    var sb=500, sw=sb*sc; g.strokeStyle='rgba(240,240,235,0.9)'; g.lineWidth=2; g.beginPath(); g.moveTo(10,H-12); g.lineTo(10+sw,H-12); g.moveTo(10,H-16); g.lineTo(10,H-8); g.moveTo(10+sw,H-16); g.lineTo(10+sw,H-8); g.stroke(); g.font='600 11px system-ui,sans-serif'; g.textAlign='left'; g.fillStyle='rgba(240,240,235,0.95)'; g.fillText('500 m',16+sw,H-8); }
  layout(); return {draw:draw,layout:function(){ layout(); bg=null; },tx:tx}; }

// ---------- DUELO MAR: dos buques en mar abierto (reglas de juego, no predicción) ----------
var SAM2=/\b(?:RIM-\d+|Standard|SM-[1-6]|ESSM|Sea Sparrow|Aster|Barak|Sea Wolf|Sea Dart|Sea Ceptor|CAMM|S-300F?M?|Fort-?M?\b|Shtil|Kinzhal|Kortik|OSA-?MA?|Tor-?M?\d?\b|Klinok|HHQ-?\d+|HQ-\d+|Aspide|Albatros|Crotale|Mistral|Sadral|Redut|Poliment|Sea ?Cat|Terrier|Tartar|Talos|Volna|Shtorm|Uragan|Umkhonto|superficie-aire|antiaére\w*)/i;
var HEAVY=/Granit|P-700|P-500|Bazalt|P-1000|Vulkan|P-6\b/i;
function cntIn(s,re){ var m,best=0,g=new RegExp(re.source,'gi'); while((m=g.exec(String(s||'')))){ var v=parseInt(m[1],10); if(v>best&&v<=128) best=v; if(g.lastIndex===m.index) g.lastIndex++; } return best; }
function marKit(a,I){ if(a._mk) return a._mk; var L=linesOf(a), F=a.F||{}, K={};
  function lw(r,not){ for(var i=0;i<L.length;i++){ if(r.test(L[i])&&!(not&&not.test(L[i]))) return L[i]; } return null; }
  var as=lw(/Harpoon|Exocet|NSM|Naval Strike|Kalibr|Klub|Oniks|Yakhont|BrahMos|Granit|Moskit|Uran|Kh-35|P-15|P-500|P-700|P-800|P-270|Termit|Styx|SS-N-|YJ-|C-80\d|Otomat|Teseo|RBS[- ]?15|Gabriel|Hsiung|Type 90 SSM|SSM-|Penguin|Zircon|Tsirkon|Bazalt|Sea Skua/i)||lw(ASHM_GEN);
  if(as){ var tok=rxs(as,ASHM)||'antibuque', arm=wlink(tok,I,'ashm'); var n=cntIn(as,/(\d{1,3})\s*(?:×\s*)?(?:misiles|missiles)/)||cntIn(as,/^(\d{1,2})\s*×/);
    var sup=SUPERS.test(tok+' '+as)||HEAVY.test(as);
    K.ash={n:(/^anti/i.test(tok)?LL2('misil antibuque','anti-ship missile'):tok), tok:tok, arm:arm, km:(arm&&arm.walc)?arm.walc:(sup?300:120), src:(arm&&arm.walc)?'ficha':'est', N:Math.max(2,Math.min(24,n||8)), Nsrc:n?'ficha':'est', sup:sup, v:sup?750:270, wh:HEAVY.test(as)?750:(sup?300:200), line:as}; }
  var SAMN=/\b(?:RIM-\d+\w*|Standard|SM-[1-6]\w*|ESSM|Sea Sparrow|Aster ?\d*|Barak ?\w*|Sea Wolf|Sea Dart|Sea Ceptor|CAMM|S-300F?M?|Shtil-?\d?|Kinzhal|Kortik|OSA-?MA?|Tor-?M?\d?|Klinok|HHQ-?\d+\w*|HQ-\d+\w*|Aspide|Albatros|Crotale|Mistral|Sadral|Redut|Poliment|Sea ?Cat|Terrier|Tartar|Talos|Volna|Shtorm|Uragan|Umkhonto)(?![A-Za-zñ])/i;
  var sl=null; for(var si=0;si<L.length;si++){ if(L[si]!==as&&(SAMN.test(L[si])||(SAM2.test(L[si])&&/misil|missile/i.test(L[si])))&&!/^\W*\d*\W*(?:tubos?|torpedo)/i.test(L[si])){ if(SAMN.test(L[si])){ sl=L[si]; break; } if(!sl) sl=L[si]; } }
  if(sl){ var st=null,sa=null,mm,gs=new RegExp(SAMN.source,'gi'); while((mm=gs.exec(sl))){ if(/RIM-161|SM-3|RIM-174|SM-6/i.test(mm[0])) continue; var tk_=/SM-[12]\s?MR|RIM-66/i.test(mm[0])?'RIM-66':/SM-[12]\s?ER|RIM-67/i.test(mm[0])?'RIM-67':/^ESSM$/i.test(mm[0])?'RIM-162':(/^Standard$/i.test(mm[0])&&/SM-[12]\s?MR|RIM-66/i.test(sl))?'RIM-66':mm[0]; var lk_=wlink(tk_,I,'sam'); if(!st){ st=mm[0]; sa=lk_; } if(lk_&&lk_.walc&&(!(sa&&sa.walc)||(/\d/.test(mm[0])&&!/\d/.test(st)))){ st=mm[0]; sa=lk_; if(/\d/.test(st)) break; } } if(!st) st=LL2('antiaéreos','SAM'); var sn=cntIn(sl,/(\d{1,3})\s*(?:×\s*)?(?:misiles|missiles)/)||cntIn(sl,/(\d{1,3})\s*celdas/);
    var mod=era(a)>=1980; K.sam={n:st, arm:sa, km:(sa&&sa.walc)?Math.min(sa.walc,400):40, src:(sa&&sa.walc)?'ficha':'est', N:Math.max(4,Math.min(96,sn||16)), Nsrc:sn?'ficha':'est', pk:mod?0.6:0.45, ch:mod?4:2}; }
  var cl=lw(CIWS); if(cl) K.ciws={n:rx(cl,/Phalanx|Goalkeeper|Meroka|AK-630|Kashtan|Pantsir|SeaRAM|Kortik|Type 730|Type 1130|Millennium|RAM\b/i)||''};
  var best=0,brl=1,gl=null; L.forEach(function(l){ if(/torpedo|misil|missile|CIWS|Phalanx|Goalkeeper|Meroka|AK-630|Kashtan|Kortik|ametralladora|machine gun|cohete|rocket|mina|carga de profundidad|antisubmarin|blindaje|cinturón/i.test(l)) return; var c=0,m,g=/(\d{2,3}(?:[.,]\d)?)\s*mm/g; var t=esN(l); while((m=g.exec(t))){ var v=parseFloat(m[1].replace(',','.')); if(v>=57&&v<=460&&v>c) c=v; } var gc=/(\d{1,2}(?:[.,]\d)?)\s*cm\b/g; while((m=gc.exec(t))){ var v2=parseFloat(m[1].replace(',','.'))*10; if(v2>=57&&v2<=460&&v2>c) c=v2; } var mi=t.match(/(\d{1,2}(?:[.,]\d+)?)\s*(?:pulgadas|in\b|")/i); if(!c&&mi){ var vi=parseFloat(mi[1].replace(',','.'))*25.4; if(vi>=57&&vi<=460) c=vi; } if(c>best){ best=c; gl=l; var nb=t.match(/^(\d{1,2})\s*×/); brl=nb?Math.min(12,parseInt(nb[1],10)):1; } });
  if(best){ var c2=best; var prj=cntIn(esN(gl),/(\d{2,4})\s*(?:proyectiles|disparos estibados|rounds)/); K.gun={cal:Math.round(c2), brl:brl, rdsrc:prj?'ficha':'est', km:c2<=80?16:c2<=135?23:c2<=160?25:c2<=210?28:c2<=310?35:38, rpm:c2<=80?60:c2<=135?20:c2<=160?8:c2<=210?4:2, rd:prj&&prj>=50&&prj<=3000?prj:(c2<=135?400:150*brl), line:gl}; }
  K.desp=a.desp||null; K.d=a.desp||3000; K.kn=a.kn||null; K.v=(a.kn||28)*0.5144;
  K.radar=era(a)>=1943||/radar/i.test(F.sensores||'');
  K.mast=Math.max(12,Math.min(45,12+Math.sqrt(K.d)/4));
  var aer=String(a.aer||F.aeronaves||''); K.helo=era(a)>=1960&&/helic|Seahawk|Sea ?King|Lynx|Wildcat|NH ?90|Merlin|Ka-\d|SH-\d|Z-9|Z-20|Panther|Dauphin|Super Puma|AB ?212/i.test(aer);
  K.chaff=era(a)>=1965?8:0; K.mod=era(a)>=1980;
  a._mk=K; return K; }
function hzn(h1,h2){ return 4120*(Math.sqrt(h1)+Math.sqrt(h2)); }
function marDet(K,tK,night){ if(!K.radar) return night?8000:20000; var r=hzn(K.mast,tK.mast); if(K.helo) r=Math.max(r,180000); return r; }
function mShort(a){ return String(a.n||'').replace(/^Clase\s+/i,'').replace(/\s*\(.*?\)\s*/g,' ').replace(/[\s-]+class\b.*$/i,'').trim(); }
function MARsim(A,B,WA,WB,seed,night){
  var rnd=mkRng(seed); R=rnd; var I=(window.MAT_DATA&&window.MAT_DATA.items)||[];
  var S={mode:'mar',T:0,U:[],P:[],FX:[],ev:[],over:null,seed:seed,reasons:[],night:!!night,first:null,kill:null,
    st:[{ml:0,mh:0,sam:0,ciws:0,chaff:0,fuel:0,gs:0,gh:0,det:null,fire:null},{ml:0,mh:0,sam:0,ciws:0,chaff:0,fuel:0,gs:0,gh:0,det:null,fire:null}]};
  function log(es,en,cls){ var L=S.ev[S.ev.length-1]; if(L&&L.es===es&&S.T-L.t<20) return; S.ev.push({t:S.T,es:es,en:en,cls:cls||''}); }
  var nA=mShort(A), nB=mShort(B); if(nA===nB){ nA+=LL2(' (azul)',' (blue)'); nB+=LL2(' (rojo)',' (red)'); }
  [A,B].forEach(function(a,i){ var K=marKit(a,I); S.U.push({i:i,a:a,sn:i?nB:nA,K:K,x:0,y:0,hd:0,hp:1,alive:true,ash:K.ash?K.ash.N:0,sam:K.sam?K.sam.N:0,chaff:K.chaff,grd:K.gun?K.gun.rd:0,gcd:0,scd:0,ccd:0,salvo:0,q:[],trk:false,trail:[]}); });
  var U=S.U, a0=U[0], b0=U[1];
  function eff(u,t){ var d=marDet(u.K,t.K,S.night); return Math.max(u.K.ash?Math.min(u.K.ash.km*1000,d):0, u.K.gun?u.K.gun.km*1000:0, d*0.6); }
  var D0=Math.max(60000,Math.min(230000,Math.max(eff(a0,b0),eff(b0,a0))+40000+rnd()*20000));
  var off=(rnd()-0.5)*0.6; a0.x=0; a0.y=0; b0.x=D0*Math.cos(off); b0.y=D0*Math.sin(off);
  a0.hd=off+(rnd()-0.5)*0.8; b0.hd=off+Math.PI+(rnd()-0.5)*0.8;
  S.D0=D0;
  function dist(p,q){ return Math.hypot(q.x-p.x,q.y-p.y); }
  function brg(p,q){ return Math.atan2(q.y-p.y,q.x-p.x); }
  function km(m){ return fmtD(m); }
  function fx(o){ o.t=0; S.FX.push(o); }
  function offense(u){ return u.alive&&(u.ash>0||(u.K.gun&&u.grd>0)); }
  function launch(u,t){ var K=u.K.ash, n=Math.min(u.ash,Math.max(2,Math.min(8,Math.ceil(K.N/2)))); u.ash-=n; S.st[u.i].ml+=n; var d=dist(u,t);
    for(var k=0;k<n;k++) u.q.push({at:S.T+k*3});
    if(S.first==null){ S.first=u.i; S.st[u.i].fire={d:d,n:n}; }
    log('El '+u.sn+' lanza '+n+' misiles '+K.n+' a '+km(d),u.sn+' fires '+n+' '+K.n+' missiles at '+km(d),u.i?'r':'b'); }
  function spawn(u,t){ var K=u.K.ash; S.P.push({k:'ashm',own:u,tgt:t,aim:null,x:u.x,y:u.y,hd:brg(u,t),v:K.v*(0.95+rnd()*0.1),wh:K.wh,sup:K.sup,trav:0,max:K.km*1100,seen:false,eng:0,ciws:false,chf:false,trail:[[u.x,u.y]],done:false}); }
  function kill(P,how){ P.done=true; P.fade=0; var st=S.st[P.own.i]; if(how==='sam') st.sam++; else if(how==='ciws') st.ciws++; else if(how==='chaff') st.chaff++; else if(how==='fuel') st.fuel++; fx({k:how==='chaff'||how==='fuel'?'splash':'burst',x:P.x,y:P.y,life:how==='fuel'?6:4}); }
  function hit(P){ var t=P.tgt; P.done=true; P.fade=0; S.st[P.own.i].mh++; var dmg=0.33*(P.wh/220)*Math.pow(9800/t.K.d,0.55)*(0.8+rnd()*0.4); t.hp-=dmg; fx({k:'hit',x:t.x,y:t.y,life:8});
    log('¡Impacto! Un '+P.own.K.ash.n+' alcanza al '+t.sn+' (integridad '+Math.max(0,Math.round(t.hp*100))+' %)','Hit! A '+P.own.K.ash.n+' strikes the '+t.sn+' (integrity '+Math.max(0,Math.round(t.hp*100))+' %)',P.own.i?'r':'b');
    if(t.hp<=0&&t.alive){ t.alive=false; S.kill={by:P.own.i,w:'ashm',t:S.T}; S.over={w:P.own.i,how:'ko'}; log('El '+t.sn+' queda fuera de combate','The '+t.sn+' is put out of action','end'); fx({k:'boom',x:t.x,y:t.y,life:14}); } }
  S.step=function(dt0){ if(S.over) return; var dt=dt0*4; S.T+=dt;
    U.forEach(function(u){ var t=U[1-u.i]; if(!u.alive) return; var d=dist(u,t);
      if(!u.trk&&t.alive&&d<=marDet(u.K,t.K,S.night)){ u.trk=true; S.st[u.i].det={d:d,t:S.T,how:(u.K.helo&&d>hzn(u.K.mast,t.K.mast))?'helo':(u.K.radar?'radar':'vis')};
        var h=S.st[u.i].det.how; log('El '+u.sn+' detecta al '+t.sn+' a '+km(d)+(h==='helo'?' con su helicóptero':h==='radar'?' con su radar':' a simple vista'),u.sn+' detects the '+t.sn+' at '+km(d)+(h==='helo'?' with its helicopter':h==='radar'?' with its radar':' by eye'),u.i?'r':'b'); }
      /* rumbo */
      var b=brg(u,t), want=b, mR=u.K.ash&&u.ash>0?u.K.ash.km*1000*0.92:0, gR=u.K.gun&&u.grd>0?u.K.gun.km*1000*0.8:0;
      if(u.trk){ if(u.ash>0||u.q.length){ if(d<=mR) want=b+(u.i?-1:1)*Math.PI/2; }
        else if(gR){ if(d<=gR) want=b+(u.i?-1:1)*Math.PI/2*0.9; }
        else if(offense(t)) want=b+Math.PI; }
      else want=b+(u.i?0.15:-0.15);
      var dh=ang(want-u.hd), tr=0.022*dt; u.hd+=Math.max(-tr,Math.min(tr,dh));
      u.x+=Math.cos(u.hd)*u.K.v*dt; u.y+=Math.sin(u.hd)*u.K.v*dt;
      if(!u.trail.length||Math.hypot(u.x-u.trail[u.trail.length-1][0],u.y-u.trail[u.trail.length-1][1])>1500){ u.trail.push([u.x,u.y]); if(u.trail.length>120) u.trail.shift(); }
      /* misiles antibuque */
      u.salvo-=dt; if(u.trk&&t.alive&&u.ash>0&&u.salvo<=0&&!u.q.length&&d<=u.K.ash.km*1000){ launch(u,t); u.salvo=420; }
      while(u.q.length&&u.q[0].at<=S.T){ u.q.shift(); spawn(u,t); }
      /* cañón */
      u.gcd-=dt; if(u.K.gun&&u.grd>0&&u.trk&&t.alive&&d<=u.K.gun.km*1000&&u.gcd<=0){ var G=u.K.gun; u.gcd=60/G.rpm; u.grd-=G.brl; S.st[u.i].gs+=G.brl;
        if(!u.gunlog){ u.gunlog=1; log('El '+u.sn+' abre fuego con el cañón de '+G.cal+' mm a '+km(d),u.sn+' opens fire with its '+G.cal+' mm gun at '+km(d),u.i?'r':'b'); }
        for(var k=0;k<G.brl;k++){ var p=(u.K.mod?0.14:era(u.a)>=1955?0.1:0.06)*(1-0.6*d/(G.km*1000))*(S.night&&!u.K.radar?0.5:1); S.P.push({k:'shell',own:u,tgt:t,x:u.x,y:u.y,sx:u.x,sy:u.y,tx:t.x+(rnd()-0.5)*600,ty:t.y+(rnd()-0.5)*600,v:800,tof:d/800,t:0,hit:rnd()<p,cal:G.cal,done:false}); } } });
    /* defensas del buque atacado */
    U.forEach(function(t){ if(!t.alive) return; var inc=S.P.filter(function(P){return P.k==='ashm'&&!P.done&&P.tgt===t&&!P.aim;});
      var Dm=t.K.radar?hzn(t.K.mast,5):4000;
      inc.forEach(function(P){ var d=dist(P,t); if(!P.seen&&d<=Dm){ P.seen=true; if(!t.mlog||S.T-t.mlog>60){ t.mlog=S.T; log('El '+t.sn+' detecta misiles en vuelo rasante a '+km(d),'The '+t.sn+' detects sea-skimming missiles at '+km(d),t.i?'r':'b'); } } });
      t.scd-=dt; if(t.K.sam&&t.sam>0&&t.scd<=0){ var live=S.P.filter(function(q){return q.k==='sam'&&!q.done&&q.own===t;}).length;
        var cand=inc.filter(function(P){ return P.seen&&P.eng<2&&dist(P,t)<=t.K.sam.km*1000&&dist(P,t)>2500; }).sort(function(p,q){return dist(p,t)-dist(q,t);});
        if(cand.length&&live<t.K.sam.ch*2){ var P=cand[0]; P.eng++; t.sam--; t.scd=t.K.mod?2:5; S.P.push({k:'sam',own:t,tgt:P,x:t.x,y:t.y,v:900,trail:[[t.x,t.y]],done:false,life:0});
          if(!t.slog||S.T-t.slog>40){ t.slog=S.T; log('El '+t.sn+' lanza misiles '+t.K.sam.n+' contra los misiles que llegan','The '+t.sn+' launches '+t.K.sam.n+' missiles at the incoming missiles',t.i?'r':'b'); } } }
      t.ccd-=dt; var close=inc.filter(function(P){return dist(P,t)<12000;});
      if(t.chaff>0&&t.ccd<=0&&close.length){ t.chaff--; t.ccd=40; var cx=t.x+Math.cos(t.hd+2.2)*900, cy=t.y+Math.sin(t.hd+2.2)*900; fx({k:'chaff',x:cx,y:cy,life:90});
        if(!t.clog||S.T-t.clog>60){ t.clog=S.T; log('El '+t.sn+' lanza chaff','The '+t.sn+' fires chaff',t.i?'r':'b'); }
        close.forEach(function(P){ if(P.chf) return; P.chf=true; if(rnd()<(P.sup?0.2:0.3)){ P.aim={x:cx+(rnd()-0.5)*400,y:cy+(rnd()-0.5)*400}; } }); }
      if(t.K.ciws){ var win=inc.filter(function(P){return !P.aim&&dist(P,t)<2000;}); win.forEach(function(P){ if(P.ciws) return; P.ciws=true; fx({k:'ciws',x:t.x,y:t.y,tx:P.x,ty:P.y,life:2.5}); var pk=(P.sup?0.35:0.55)/(1+0.35*(win.length-1)); if(rnd()<pk){ kill(P,'ciws'); if(!t.cwlog||S.T-t.cwlog>30){ t.cwlog=S.T; log('El CIWS del '+t.sn+' derriba un misil a menos de 2 km','The '+t.sn+'’s CIWS shoots down a missile under 2 km out',t.i?'r':'b'); } } }); } });
    /* proyectiles */
    S.P.forEach(function(P){ if(P.done) return;
      if(P.k==='ashm'){ var t=P.tgt, gx=P.aim?P.aim.x:t.x, gy=P.aim?P.aim.y:t.y; var w=Math.atan2(gy-P.y,gx-P.x), dh=ang(w-P.hd), m=0.12*dt; P.hd+=Math.max(-m,Math.min(m,dh)); var st=P.v*dt; P.x+=Math.cos(P.hd)*st; P.y+=Math.sin(P.hd)*st; P.trav+=st;
        if(!P.trail.length||Math.hypot(P.x-P.trail[P.trail.length-1][0],P.y-P.trail[P.trail.length-1][1])>800){ P.trail.push([P.x,P.y]); if(P.trail.length>40) P.trail.shift(); }
        var dg=Math.hypot(gx-P.x,gy-P.y);
        if(P.aim&&dg<st+80){ kill(P,'chaff'); if(!P.own.chlog||S.T-P.own.chlog>40){ P.own.chlog=S.T; log('Un '+P.own.K.ash.n+' se va tras la nube de chaff y cae al mar','A '+P.own.K.ash.n+' goes for the chaff cloud and falls into the sea',t.i?'r':'b'); } }
        else if(!P.aim&&t.alive&&dg<st+60) hit(P);
        else if(!t.alive){ P.done=true; P.fade=0; } else if(P.trav>P.max){ kill(P,'fuel'); } }
      else if(P.k==='sam'){ var M=P.tgt; P.life+=dt; if(M.done){ P.done=true; P.fade=0; return; } var w2=Math.atan2(M.y-P.y,M.x-P.x); var s2=P.v*dt; var dm=Math.hypot(M.x-P.x,M.y-P.y);
        if(dm<=s2+150){ P.done=true; P.fade=0; var o=P.own; if(rnd()<o.K.sam.pk*(M.sup?0.7:1)){ kill(M,'sam'); } else fx({k:'puff',x:M.x,y:M.y,life:3}); return; }
        P.x+=Math.cos(w2)*s2; P.y+=Math.sin(w2)*s2; P.trail.push([P.x,P.y]); if(P.trail.length>12) P.trail.shift(); if(P.life>120){ P.done=true; P.fade=0; } }
      else if(P.k==='shell'){ P.t+=dt; var f=Math.min(1,P.t/P.tof); var t3=P.tgt; var ex=P.hit?t3.x:P.tx, ey=P.hit?t3.y:P.ty; P.x=P.sx+(ex-P.sx)*f; P.y=P.sy+(ey-P.sy)*f;
        if(f>=1){ P.done=true; P.fade=0; if(P.hit&&t3.alive){ S.st[P.own.i].gh++; var dmg=0.012*Math.pow(P.cal/127,3)*Math.pow(9800/t3.K.d,0.55)*(0.7+rnd()*0.6); t3.hp-=dmg; fx({k:'hit',x:t3.x,y:t3.y,life:4});
            if(t3.hp<=0){ t3.alive=false; S.kill={by:P.own.i,w:'gun',t:S.T}; S.over={w:P.own.i,how:'ko'}; log('El '+t3.sn+' queda fuera de combate por el fuego de cañón','The '+t3.sn+' is put out of action by gunfire','end'); fx({k:'boom',x:t3.x,y:t3.y,life:14}); } }
          else fx({k:'splash',x:ex,y:ey,life:3}); } } });
    S.P.forEach(function(P){ if(P.done) P.fade=(P.fade||0)+dt; }); S.P=S.P.filter(function(P){return !P.done||P.fade<1;});
    S.FX.forEach(function(f){f.t+=dt;}); S.FX=S.FX.filter(function(f){return f.t<f.life;});
    var fly=S.P.some(function(P){return !P.done;})||U.some(function(u){return u.q.length;});
    if(!S.over&&!fly&&(S.T>10800||(!offense(a0)&&!offense(b0)))){ var w=a0.hp>=b0.hp?0:1; if(a0.hp===b0.hp) w=(S.st[0].mh+S.st[0].gh)>=(S.st[1].mh+S.st[1].gh)?0:1; S.over={w:w,how:'pts'}; log('Fin: ningún buque queda fuera de combate','Over: no ship is put out of action','end'); }
    if(S.over&&!S.reasons.length) S.reasons=marReasons(S);
  };
  S.post=function(dt){ S.FX.forEach(function(f){f.t+=dt*10;}); S.FX=S.FX.filter(function(f){return f.t<f.life;}); };
  S.tsc=function(){ if(S.over) return 1; var near=S.P.some(function(P){return !P.done&&(P.k==='sam'||P.k==='shell'||(P.k==='ashm'&&Math.hypot(P.tgt.x-P.x,P.tgt.y-P.y)<15000));}); if(near) return 6; if(S.P.some(function(P){return !P.done;})||U.some(function(u){return u.q.length;})) return 30; return 220; };
  S.hud=function(){ return U.map(function(u){ var p=[]; if(u.K.ash) p.push(u.K.ash.n+' '+u.ash+'/'+u.K.ash.N); else p.push(LL2('sin misiles antibuque','no anti-ship missiles')); if(u.K.sam) p.push('SAM '+u.sam); if(u.K.ciws) p.push('CIWS'); if(u.K.gun) p.push(LL2('cañón ','gun ')+u.K.gun.cal+' mm'); if(u.K.chaff) p.push('chaff '+u.chaff); p.push(u.trk?LL2('contacto','contact'):LL2('buscando','searching'));
    return {c:u.i,n:u.sn,hp:Math.max(0,Math.round(u.hp*100)),fuel:null,txt:p.join(' · ')}; }); };
  return S; }
function marReasons(S){ var U=S.U, R_=[]; function P(es,en){ R_.push(LL2(es,en)); }
  var d0=S.st[0].det, d1=S.st[1].det; if(d0||d1){ var f=!d1||(d0&&d0.t<=d1.t)?0:1, dd=S.st[f].det; P('El '+U[f].sn+' detecta primero al rival, a '+fmtD(dd.d)+(dd.how==='helo'?', gracias a su helicóptero embarcado (unos 180 km, estimación)':dd.how==='radar'?', con su radar: el horizonte de radar limita la detección a unos '+fmtD(hzn(U[f].K.mast,U[1-f].K.mast))+' (fórmula del horizonte; altura del mástil estimada)':', a simple vista'),'The '+U[f].sn+' detects the rival first, at '+fmtD(dd.d)+(dd.how==='helo'?', thanks to its embarked helicopter (about 180 km, estimate)':dd.how==='radar'?', by radar: the radar horizon limits detection to about '+fmtD(hzn(U[f].K.mast,U[1-f].K.mast))+' (horizon formula; mast height estimated)':', by eye')); }
  if(S.first!=null){ var u=U[S.first], F=S.st[S.first].fire; P('El '+u.sn+' dispara primero: '+F.n+' misiles '+u.K.ash.n+' a '+fmtD(F.d)+' (alcance '+nf(u.K.ash.km)+' km'+(u.K.ash.src==='ficha'?' según su ficha':', estimación')+')','The '+u.sn+' fires first: '+F.n+' '+u.K.ash.n+' missiles at '+fmtD(F.d)+' ('+nf(u.K.ash.km)+' km range'+(u.K.ash.src==='ficha'?' from its data sheet':', estimate')+')'); }
  [0,1].forEach(function(i){ var u=U[i], s=S.st[i], o=U[1-i];
    if(!u.K.ash) P('El '+u.sn+' no tiene misiles antibuque en su ficha: tiene que acercarse para usar el cañón','The '+u.sn+' has no anti-ship missiles in its data sheet: it has to close in to use its gun');
    else if(!s.ml) P('El '+u.sn+' no llega a lanzar sus misiles: nunca tuvo al rival detectado y a su alcance','The '+u.sn+' never fires its missiles: the rival was never detected and in range');
    else { var es=[],en=[]; es.push(s.mh+' impacta'+(s.mh===1?'':'n')); en.push(s.mh+' hit'); if(s.sam){ es.push(s.sam+' derribado'+(s.sam>1?'s':'')+' por los misiles antiaéreos del '+o.sn); en.push(s.sam+' shot down by the '+o.sn+'’s SAMs'); } if(s.ciws){ es.push(s.ciws+' por el CIWS'); en.push(s.ciws+' by the CIWS'); } if(s.chaff){ es.push(s.chaff+' engañado'+(s.chaff>1?'s':'')+' por el chaff'); en.push(s.chaff+' decoyed by chaff'); } if(s.fuel){ es.push(s.fuel+' sin blanco al final de su alcance'); en.push(s.fuel+' with no target at the end of their range'); }
      P('El '+u.sn+' lanza '+s.ml+' misiles: '+es.join(', '),'The '+u.sn+' fires '+s.ml+' missiles: '+en.join(', ')); }
    if(s.gs) P('El '+u.sn+': '+s.gs+' disparos de cañón ('+u.K.gun.cal+' mm), '+s.gh+' impacto'+(s.gh===1?'':'s'),'The '+u.sn+': '+s.gs+' gun rounds ('+u.K.gun.cal+' mm), '+s.gh+' hit'+(s.gh===1?'':'s')); });
  if(!!U[0].K.sam!==!!U[1].K.sam||!!U[0].K.ciws!==!!U[1].K.ciws){ [0,1].forEach(function(i){ var u=U[i]; P('Defensas del '+u.sn+': '+(u.K.sam?LL2('misiles antiaéreos '+u.K.sam.n,'SAM '+u.K.sam.n):LL2('sin misiles antiaéreos','no SAMs'))+(u.K.ciws?' · CIWS '+u.K.ciws.n:LL2(' · sin CIWS',' · no CIWS')),u.sn+'’s defences: '+(u.K.sam?'SAM '+u.K.sam.n:'no SAMs')+(u.K.ciws?' · CIWS '+u.K.ciws.n:' · no CIWS')); }); }
  var big=U[0].K.d>=U[1].K.d?0:1; if(U[big].K.d>U[1-big].K.d*1.6) P('El '+U[big].sn+' desplaza '+nf(U[big].K.d)+' t frente a '+nf(U[1-big].K.d)+' t: aguanta más impactos (regla del juego)','The '+U[big].sn+' displaces '+nf(U[big].K.d)+' t against '+nf(U[1-big].K.d)+' t: it takes more hits (game rule)');
  if(S.kill) P(S.kill.w==='ashm'?'Golpe decisivo: un '+U[S.kill.by].K.ash.n+' deja al '+U[1-S.kill.by].sn+' fuera de combate':'Golpe decisivo: el cañón del '+U[S.kill.by].sn+' deja al '+U[1-S.kill.by].sn+' fuera de combate',S.kill.w==='ashm'?'Decisive hit: a '+U[S.kill.by].K.ash.n+' puts the '+U[1-S.kill.by].sn+' out of action':'Decisive hit: the '+U[S.kill.by].sn+'’s gun puts the '+U[1-S.kill.by].sn+' out of action');
  else { var wM=U[S.over?S.over.w:0], lM=U[1-wM.i]; P('Ningún buque fuera de combate. Gana a los puntos el '+wM.sn+': conserva el '+Math.max(0,Math.round(wM.hp*100))+' % de integridad frente al '+Math.max(0,Math.round(lM.hp*100))+' % del '+lM.sn,'No ship put out of action. The '+wM.sn+' wins on points: it keeps '+Math.max(0,Math.round(wM.hp*100))+' % integrity vs '+Math.max(0,Math.round(lM.hp*100))+' % for the '+lM.sn); }
  if(S.night&&U[0].K.radar!==U[1].K.radar){ var r=U[0].K.radar?U[0]:U[1]; P('De noche el '+r.sn+' ve con radar y el otro solo a simple vista (unos 8 km)','At night the '+r.sn+' sees by radar and the other only by eye (about 8 km)'); }
  return R_; }
function MARview(cv,S){ var g=cv.getContext('2d'), W=0,H=0,dpr=1, cam={x:0,y:0,s:0};
  function layout(){ var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  function tx(x,y){ return [W/2+(x-cam.x)*cam.s, H/2+(y-cam.y)*cam.s]; }
  function fit(){ var xs=[],ys=[], foc=null, bd=45000; S.P.forEach(function(P){ if(P.k==='ashm'&&!P.done&&!S.over){ var dd=Math.hypot(P.tgt.x-P.x,P.tgt.y-P.y); if(dd<bd){ bd=dd; foc=P.tgt; } } });
    if(foc){ xs.push(foc.x); ys.push(foc.y); S.P.forEach(function(P){ if(!P.done&&(P.k!=='shell')&&Math.hypot(foc.x-P.x,foc.y-P.y)<50000){ xs.push(P.x); ys.push(P.y); } }); } else { S.U.forEach(function(u){ xs.push(u.x); ys.push(u.y); }); S.P.forEach(function(P){ if(P.k==='ashm'&&!P.done){ xs.push(P.x); ys.push(P.y); } }); }
    var x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs), y0=Math.min.apply(null,ys), y1=Math.max.apply(null,ys); var sw=Math.max(8000,x1-x0), sh=Math.max(8000,y1-y0);
    var s=Math.min((W-170)/sw,(H-100)/sh), cx=(x0+x1)/2, cy=(y0+y1)/2; if(!cam.s){ cam.s=s; cam.x=cx; cam.y=cy; } else { cam.s*=Math.pow(s/cam.s,0.12); cam.x+=(cx-cam.x)*0.15; cam.y+=(cy-cam.y)*0.15; } }
  function nice(m){ var c=[1000,2000,5000,10000,20000,50000,100000]; for(var i=0;i<c.length;i++){ if(c[i]*cam.s>=60) return c[i]; } return 100000; }
  function draw(){ fit(); g.setTransform(dpr,0,0,dpr,0,0); var night=S.night;
    var gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,night?'#08182b':'#1d5684'); gr.addColorStop(1,night?'#0b2138':'#17466e'); g.fillStyle=gr; g.fillRect(0,0,W,H);
    var st=nice()*1; g.strokeStyle='rgba(255,255,255,0.06)'; g.lineWidth=1; var o=tx(0,0), sp=st*cam.s; if(sp>20){ var ox=((o[0]%sp)+sp)%sp, oy=((o[1]%sp)+sp)%sp; for(var x=ox;x<W;x+=sp){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); } for(var y=oy;y<H;y+=sp){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); } }
    var COL=['#4f95ff','#ff5a4a'], COLA=['rgba(79,149,255,','rgba(255,90,74,'];
    S.U.forEach(function(u){ if(!u.alive) return; var p=tx(u.x,u.y), t=S.U[1-u.i]; var rd=marDet(u.K,t.K,S.night)*cam.s; if(rd<Math.max(W,H)*1.5){ g.strokeStyle=COLA[u.i]+'0.28)'; g.setLineDash([1,5]); g.lineWidth=1; g.beginPath(); g.arc(p[0],p[1],rd,0,Math.PI*2); g.stroke(); }
      if(u.K.ash&&u.ash>0){ var rr=u.K.ash.km*1000*cam.s; if(rr<Math.max(W,H)*1.5){ g.strokeStyle=COLA[u.i]+'0.5)'; g.setLineDash([7,5]); g.lineWidth=1.2; g.beginPath(); g.arc(p[0],p[1],rr,0,Math.PI*2); g.stroke(); } } g.setLineDash([]); });
    S.U.forEach(function(u){ if(u.trail.length<2) return; g.strokeStyle='rgba(255,255,255,0.22)'; g.lineWidth=1.5; g.beginPath(); var s=tx(u.trail[0][0],u.trail[0][1]); g.moveTo(s[0],s[1]); u.trail.forEach(function(q){ var r=tx(q[0],q[1]); g.lineTo(r[0],r[1]); }); var e=tx(u.x,u.y); g.lineTo(e[0],e[1]); g.stroke(); });
    var a=S.U[0], b=S.U[1]; if(a.alive&&b.alive&&(a.trk||b.trk)){ var pa=tx(a.x,a.y), pb=tx(b.x,b.y); g.strokeStyle='rgba(255,255,255,0.16)'; g.setLineDash([2,6]); g.beginPath(); g.moveTo(pa[0],pa[1]); g.lineTo(pb[0],pb[1]); g.stroke(); g.setLineDash([]); }
    S.FX.forEach(function(f){ if(f.k!=='chaff') return; var p=tx(f.x,f.y), k=f.t/f.life; for(var i=0;i<14;i++){ g.fillStyle='rgba(225,225,225,'+(0.7*(1-k))+')'; g.beginPath(); g.arc(p[0]+Math.sin(i*2.1)*(4+10*k)*(1+i%3*0.4),p[1]+Math.cos(i*1.3)*(4+10*k)*(1+i%2*0.5),1.3,0,Math.PI*2); g.fill(); } });
    S.P.forEach(function(P){ if(P.k==='ashm'){ var al=P.done?Math.max(0,1-P.fade):1; if(P.trail.length>1){ g.strokeStyle='rgba(240,240,240,'+(0.55*al)+')'; g.lineWidth=1.6; g.beginPath(); var s=tx(P.trail[0][0],P.trail[0][1]); g.moveTo(s[0],s[1]); P.trail.forEach(function(q){ var r=tx(q[0],q[1]); g.lineTo(r[0],r[1]); }); var e=tx(P.x,P.y); g.lineTo(e[0],e[1]); g.stroke(); } if(!P.done){ var p=tx(P.x,P.y); g.fillStyle=COL[P.own.i]; g.strokeStyle='#fff'; g.lineWidth=1; g.beginPath(); g.arc(p[0],p[1],2.8,0,Math.PI*2); g.fill(); g.stroke(); } }
      else if(P.k==='sam'&&!P.done){ if(P.trail.length>1){ g.strokeStyle='rgba(120,240,255,0.8)'; g.lineWidth=1.4; g.beginPath(); var s2=tx(P.trail[0][0],P.trail[0][1]); g.moveTo(s2[0],s2[1]); P.trail.forEach(function(q){ var r=tx(q[0],q[1]); g.lineTo(r[0],r[1]); }); g.stroke(); } var p2=tx(P.x,P.y); g.fillStyle='#bff6ff'; g.beginPath(); g.arc(p2[0],p2[1],1.8,0,Math.PI*2); g.fill(); }
      else if(P.k==='shell'&&!P.done){ var p3=tx(P.x,P.y); g.fillStyle='#ffe28a'; g.beginPath(); g.arc(p3[0],p3[1],1.6,0,Math.PI*2); g.fill(); } });
    S.FX.forEach(function(f){ var p=tx(f.x,f.y), k=f.t/f.life;
      if(f.k==='ciws'){ var q=tx(f.tx,f.ty); g.strokeStyle='rgba(255,220,120,'+(1-k)+')'; g.lineWidth=1; for(var i=0;i<5;i++){ var j=(i-2)*3; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(q[0]+j,q[1]-j); g.stroke(); } }
      else if(f.k==='burst'||f.k==='puff'){ var R0=(f.k==='burst'?9:5)*(0.4+k); g.fillStyle=f.k==='burst'?'rgba(255,170,60,'+(0.8*(1-k))+')':'rgba(220,220,220,'+(0.6*(1-k))+')'; g.beginPath(); g.arc(p[0],p[1],R0,0,Math.PI*2); g.fill(); }
      else if(f.k==='splash'){ g.strokeStyle='rgba(255,255,255,'+(0.8*(1-k))+')'; g.lineWidth=1.4; g.beginPath(); g.arc(p[0],p[1],3+8*k,0,Math.PI*2); g.stroke(); }
      else if(f.k==='hit'||f.k==='boom'){ var R1=(f.k==='boom'?30:14)*(0.3+k); g.fillStyle='rgba(255,140,40,'+(0.7*(1-k))+')'; g.beginPath(); g.arc(p[0],p[1],R1,0,Math.PI*2); g.fill(); g.strokeStyle='rgba(255,235,170,'+(1-k)+')'; g.lineWidth=2; g.beginPath(); g.arc(p[0],p[1],R1*1.2,0,Math.PI*2); g.stroke(); } });
    S.U.forEach(function(u){ var p=tx(u.x,u.y), t=S.U[1-u.i]; if(p[0]<-20||p[0]>W+20||p[1]<-20||p[1]>H+20) return;
      drawMar(g,u.a,p[0],p[1],u.hd,COL[u.i],marPx(u.a),!u.alive);
      if(u.alive&&u.hp<0.5&&S.T%2<1){ g.fillStyle='rgba(40,40,40,0.5)'; g.beginPath(); g.arc(p[0]-4,p[1]-6,5,0,Math.PI*2); g.fill(); }
      g.font='700 11px system-ui,sans-serif'; g.textAlign='center'; var ot=tx(t.x,t.y), mh_=Math.max(11,marPx(u.a)*0.42), ly=p[1]+(u.i===0?mh_+11:-(mh_+3)); if(Math.abs(ot[0]-p[0])<90&&Math.abs(ot[1]-ly)<18) ly=p[1]+(p[1]>ot[1]?mh_+11:-(mh_+3));
      var lab=u.sn+(u.alive?'':LL2(' (fuera de combate)',' (out of action)')); var lw2=g.measureText(lab).width/2, lx=Math.max(lw2+4,Math.min(W-lw2-4,p[0])); g.lineWidth=3; g.strokeStyle='rgba(0,0,0,0.7)'; g.strokeText(lab,lx,ly); g.fillStyle='#fff'; g.fillText(lab,lx,ly);
      if(u.alive){ var bw=28, by=ly+(u.i===0?4:-15); g.fillStyle='rgba(0,0,0,0.55)'; g.fillRect(p[0]-bw/2,by,bw,4); g.fillStyle=u.hp>0.6?'#7bd36b':u.hp>0.3?'#e0b33a':'#d9493a'; g.fillRect(p[0]-bw/2+0.5,by+0.5,(bw-1)*Math.max(0,u.hp),3); } });
    S.U.forEach(function(u){ var p=tx(u.x,u.y); if(p[0]>=0&&p[0]<=W&&p[1]>=0&&p[1]<=H) return; var cx=W/2,cy=H/2,dx=p[0]-cx,dy=p[1]-cy,k=Math.min((W/2-16)/Math.abs(dx||1e-6),(H/2-30)/Math.abs(dy||1e-6)); var ex=cx+dx*k, ey=cy+dy*k, an=Math.atan2(dy,dx); g.save(); g.translate(ex,ey); g.rotate(an); g.fillStyle=COL[u.i]; g.strokeStyle='#fff'; g.lineWidth=1.2; g.beginPath(); g.moveTo(9,0); g.lineTo(-6,-6); g.lineTo(-6,6); g.closePath(); g.fill(); g.stroke(); g.restore(); var t=S.U[1-u.i], lb=u.sn+' · '+fmtD(Math.hypot(u.x-t.x,u.y-t.y)); g.font='600 11px system-ui,sans-serif'; var hw=g.measureText(lb).width/2, lx2=Math.max(hw+4,Math.min(W-hw-4,ex)), ly2=ey+(ey>H/2?-12:20); g.textAlign='center'; g.lineWidth=3; g.strokeStyle='rgba(0,0,0,0.7)'; g.strokeText(lb,lx2,ly2); g.fillStyle='#fff'; g.fillText(lb,lx2,ly2); });
    var sb=nice(), sw=sb*cam.s; g.strokeStyle='rgba(240,240,235,0.9)'; g.lineWidth=2; g.beginPath(); g.moveTo(10,H-12); g.lineTo(10+sw,H-12); g.moveTo(10,H-16); g.lineTo(10,H-8); g.moveTo(10+sw,H-16); g.lineTo(10+sw,H-8); g.stroke(); g.font='600 11px system-ui,sans-serif'; g.textAlign='left'; g.fillStyle='rgba(240,240,235,0.95)'; g.fillText((sb/1000)+' km',16+sw,H-8); }
  layout(); return {draw:draw,layout:layout,tx:tx}; }
function tF(t){ t=Math.floor(t); var h=Math.floor(t/3600), m=Math.floor(t%3600/60), s=String(t%60).padStart(2,'0'); return h?h+':'+String(m).padStart(2,'0')+':'+s:m+':'+s; }
function dCSS(){ if(document.getElementById('d2css')) return; var s=document.createElement('style'); s.id='d2css'; s.textContent='.d2-q{color:var(--dim,#9aa3ad);font-size:12px;line-height:1.35;display:block;margin-top:2px;overflow-wrap:anywhere}.d2-card{border:1px solid var(--line,#3a424c);border-radius:12px;padding:12px;margin:12px 0;scroll-margin-top:64px}.d2-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.d2-chip{border:1px solid var(--line,#3a424c);background:transparent;color:inherit;border-radius:999px;padding:7px 12px;font-size:14px;cursor:pointer}.d2-chip[aria-pressed=true]{background:#2f6e3a;border-color:#2f6e3a;color:#fff}.d2-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.d2-side h3{margin:0 0 6px;font-size:15px}.d2-side ul{margin:0;padding-left:18px;font-size:13px}.d2-side li{margin:3px 0}.d2-est{display:inline-block;font-size:10.5px;font-weight:700;border:1px solid #d6b25e;color:#d6b25e;border-radius:5px;padding:0 4px;margin-left:3px}.d2-stage{position:relative;width:100%;height:min(62vh,520px);border-radius:12px;overflow:hidden;background:#222;margin-top:8px}.d2-stage canvas{width:100%;height:100%;display:block}.d2-tools{position:absolute;right:8px;bottom:8px;display:flex;gap:6px}.d2-tools button{background:rgba(10,14,18,.75);color:#fff;border:0;border-radius:8px;padding:7px 10px;font-size:13px;cursor:pointer}.d2-hud{position:absolute;left:8px;top:8px;background:rgba(10,14,18,.65);color:#fff;border-radius:8px;padding:4px 8px;font-size:12px}.d2-ahud{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 0;font-size:12px;line-height:1.35}.d2-ah{border-left:3px solid #4f95ff;padding:2px 0 2px 7px}.d2-ah.r{border-color:#ff5a4a}.d2-ah span{color:var(--mu,#9aa3ab)}@media (max-width:560px){.d2-ahud{grid-template-columns:1fr}}.d2-log{list-style:none;padding:0;margin:6px 0;max-height:200px;overflow:auto;font-size:12.5px}.d2-log li{padding:3px 0;border-bottom:1px solid rgba(127,127,127,.15)}.d2-log li.b{color:#7fb4ff}.d2-log li.r{color:#ff8f86}.d2-log li.end{font-weight:700}.d2-btn{display:inline-block;border:0;border-radius:10px;padding:10px 14px;font-size:15px;font-weight:700;cursor:pointer;margin:4px 6px 4px 0;text-decoration:none;background:#2f6e3a;color:#fff}.d2-btn.sec{background:transparent;color:inherit;border:1px solid var(--line,#3a424c)}@media (max-width:560px){.d2-two{grid-template-columns:1fr}}'; document.head.appendChild(s); }
var D2ACTIVE=null;
var DUELO_LIVE={cielo:1,suelo:1,mar:1};
window.MAT_DUELO=function(app,X){
  if(D2ACTIVE){ D2ACTIVE(); D2ACTIVE=null; }
  dCSS(); var o=X.qs(), A=X.BY[o.a], B=X.BY[o.b];
  if(X.ensure&&((A&&A.lz&&!A._full)||(B&&B.lz&&!B._full))){app.innerHTML='<p class="sub" style="padding:24px 0">'+LL2('Cargando…','Loading…')+'</p>'; return X.ensure([A,B],function(){window.MAT_DUELO(app,X);});}
  var MODE=o.m==='sub'?'mar':(MCAT[o.m]&&o.m!=='sub'?o.m:(A?(['cielo','suelo','mar'].filter(function(k){return MCAT[k].indexOf(A.cat)>=0;})[0]):'cielo')||'cielo');
  var okc=function(a){return MCAT[MODE].indexOf(a.cat)>=0&&combat(a)&&(MODE!=='cielo'||a.cat==='aviones')&&(MODE!=='mar'||a.cat==='buques');};
  if(A&&!okc(A)) A=null; if(B&&!okc(B)) B=null;
  var WA=A?weaponsOf(A,MODE).filter(function(w){return w.k!=='bomb_air';}):[], WB=B?weaponsOf(B,MODE).filter(function(w){return w.k!=='bomb_air';}):[];
  WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,X.I,w.k);}); if(MODE==='suelo'){[A,B].forEach(function(a){if(a&&!a.blind){var b=blindMM(a); if(b) a.blind=b;}});}
  var NIGHT=o.t==='noche';
  var seed=parseInt(o.s,10); var shared=seed>0; if(!(seed>0)) seed=1+Math.floor(Math.random()*99999);
  var E='<span class="d2-est">'+LL2('Estimación','Estimate')+'</span>';
  function sideAir(a,W,col){ var K=airKit(a,W), li=[], s=spd(a);
    li.push('<li><b>'+LL2('Velocidad máxima','Top speed')+':</b> '+(s?Math.round(s).toLocaleString('es-ES')+' km/h ('+LL2('ficha','data sheet')+')':'— '+E)+'; '+LL2('en el duelo vuela a unos 1.000 km/h lejos y 700 km/h girando','in the duel it flies about 1,000 km/h far out and 700 km/h turning')+' '+E+'</li>');
    li.push('<li><b>'+LL2('Giro sostenido','Sustained turn')+':</b> '+Math.round(airTurn(a)*57.3)+' °/s '+E+'</li>');
    if(K.bvr) li.push('<li>'+X.esc(K.bvr.n)+' ×'+K.bvr.left+' '+E+': '+K.bvr.km.toLocaleString('es-ES')+' km '+(K.bvr.src==='ficha'&&K.bvr.arm?'(<a href="#/a/'+K.bvr.arm.id+'">'+LL2('ficha','data sheet')+'</a>)':E)+', Mach '+String(K.bvr.mach).replace('.',',')+(K.bvr.msrc==='wiki'?' (Wikipedia)':' '+E)+' · '+LL2('radar','radar')+'</li>');
    if(K.ir) li.push('<li>'+X.esc(K.ir.n)+' ×'+K.ir.left+' '+E+': '+K.ir.km.toLocaleString('es-ES')+' km '+(K.ir.src==='ficha'&&K.ir.arm?'(<a href="#/a/'+K.ir.arm.id+'">'+LL2('ficha','data sheet')+'</a>)':E)+', Mach '+String(K.ir.mach).replace('.',',')+(K.ir.msrc==='wiki'?' (Wikipedia)':' '+E)+' · '+LL2('infrarrojos','infrared')+(K.ir.all?LL2(', todos los aspectos',', all-aspect'):LL2(', solo por la cola',', rear-aspect only'))+'</li>');
    if(K.gun) li.push('<li>'+LL2('Cañón ','Gun ')+X.esc(K.gun.n)+': '+K.gun.rounds+LL2(' proyectiles',' rounds')+(K.gun.src==='wiki'?' (Wikipedia)':' '+E)+'</li>');
    if(!K.bvr&&!K.ir&&!K.gun) li.push('<li>'+LL2('Sin armas aire-aire en su ficha','No air-to-air weapons in its data sheet')+'</li>');
    li.push('<li>'+LL2('Contramedidas','Countermeasures')+': '+(K.cm.fl||K.cm.ch?K.cm.fl+LL2(' bengalas',' flares')+(K.cm.ch?' · '+K.cm.ch+' chaff':'')+' '+E:LL2('ninguna','none'))+' · '+LL2('combustible: rompe el combate al 22 %','fuel: breaks off at 22 %')+' '+E+'</li>');
    return '<div class="d2-side"><h3>'+col+' '+X.esc(a.n)+'</h3><ul>'+li.join('')+'</ul></div>'; }
  function sideMar(a,col){ var K=marKit(a,X.I), li=[], FS=' ('+LL2('ficha','data sheet')+')';
    function lk(o){ return o&&o.arm?' (<a href="#/a/'+o.arm.id+'">'+LL2('ficha','data sheet')+'</a>)':''; }
    li.push('<li><b>'+LL2('Desplazamiento','Displacement')+':</b> '+(K.desp?nf(K.desp)+' t'+FS:'3.000 t '+E)+' · <b>'+LL2('Velocidad','Speed')+':</b> '+(K.kn?String(K.kn).replace('.',',')+LL2(' nudos',' knots')+FS:LL2('28 nudos ','28 knots ')+E)+'</li>');
    li.push('<li><b>'+LL2('Detección','Detection')+':</b> '+(K.radar?LL2('radar, limitado por el horizonte: ≈','radar, limited by the horizon: ≈')+fmtD(hzn(K.mast,K.mast))+LL2(' contra un buque parecido y ≈',' against a similar ship and ≈')+fmtD(hzn(K.mast,5))+LL2(' contra misiles rasantes',' against sea-skimming missiles')+' '+E:LL2('a simple vista: unos 20 km de día y 8 km de noche','by eye: about 20 km by day and 8 km at night')+' '+E)+(K.helo?' · '+LL2('helicóptero embarcado: ≈180 km','embarked helicopter: ≈180 km')+' '+E:'')+'</li>');
    if(K.ash) li.push('<li><b>'+LL2('Antibuque','Anti-ship')+':</b> '+X.esc(K.ash.n)+' ×'+K.ash.N+(K.ash.Nsrc==='ficha'?FS:' '+E)+' · '+nf(K.ash.km)+' km'+(K.ash.src==='ficha'?lk(K.ash):' '+E)+' · '+(K.ash.sup?LL2('supersónico','supersonic'):LL2('subsónico, vuelo rasante','subsonic, sea-skimming'))+' '+E+'</li>');
    else li.push('<li><b>'+LL2('Antibuque','Anti-ship')+':</b> '+LL2('sin misiles antibuque en la ficha','no anti-ship missiles in the data sheet')+'</li>');
    li.push('<li><b>'+LL2('Defensa','Defence')+':</b> '+(K.sam?X.esc(K.sam.n)+' ×'+K.sam.N+(K.sam.Nsrc==='ficha'?FS:' '+E)+', '+nf(K.sam.km)+' km'+(K.sam.src==='ficha'?lk(K.sam):' '+E):LL2('sin misiles antiaéreos','no SAMs'))+' · '+(K.ciws?'CIWS '+X.esc(K.ciws.n)+FS:LL2('sin CIWS','no CIWS'))+' · '+(K.chaff?K.chaff+' '+LL2('cargas de chaff','chaff loads')+' '+E:LL2('sin chaff','no chaff'))+'</li>');
    if(K.gun) li.push('<li><b>'+LL2('Cañón','Gun')+':</b> '+K.gun.cal+' mm'+(K.gun.brl>1?' ×'+K.gun.brl:'')+FS+' · '+LL2('alcance ≈','range ≈')+K.gun.km+' km, '+K.gun.rpm+LL2(' disparos/min',' rounds/min')+' '+E+'</li>');
    return '<div class="d2-side"><h3>'+col+' '+X.esc(a.n)+'</h3><ul>'+li.join('')+'</ul></div>'; }
  function side(a,W,col){ if(!a) return '<div></div>'; if(MODE==='cielo') return sideAir(a,W,col); if(MODE==='mar') return sideMar(a,col); var c=cruise(a,MODE), li=[];
    li.push('<li><b>'+LL2('Velocidad','Speed')+':</b> '+(c.src==='ficha'?Math.round(spd(a)).toLocaleString('es-ES')+' km/h '+LL2('máx. (ficha)','max (data sheet)')+'; '+LL2('en el duelo','in the duel')+' '+Math.round(c.v*3.6)+' km/h '+E:Math.round(c.v*3.6)+' km/h '+E)+'</li>');
    if(MODE==='cielo') li.push('<li><b>'+LL2('Giro sostenido','Sustained turn')+':</b> '+Math.round(turnRate(a)*57.3)+' °/s '+E+(era(a)>1965&&a.cat!=='helicopteros'?' · '+LL2('bengalas y señuelos','flares and chaff')+' '+E:'')+'</li>');
    if(MODE==='suelo'){ var K=gndKit(a,W), FS=' ('+LL2('ficha','data sheet')+')';
      li.push('<li><b>'+LL2('Blindaje frontal','Frontal armour')+':</b> '+nf(K.ke)+' mm '+LL2('frente a perforantes (APFSDS)','vs kinetic rounds (APFSDS)')+' · '+nf(K.ce)+' mm '+LL2('frente a carga hueca (HEAT y misiles)','vs shaped charges (HEAT and missiles)')+(K.armsrc==='ficha'?FS+(K.ceest?' · HEAT '+E:''):' '+E)+(K.armq?'<br><small class="d2-q">«'+X.esc(short(K.armq,140))+'»</small>':'')+'</li>');
      li.push('<li><b>'+LL2('Lateral y trasera','Side and rear')+':</b> ≈40 % '+LL2('y','and')+' ≈20 % '+LL2('del frontal','of the front')+' '+E+'</li>');
      if(K.main) li.push('<li><b>'+LL2('Cañón','Main gun')+':</b> '+(K.cal?String(K.cal).replace('.',',')+' mm':'')+' · '+LL2('penetración','penetration')+' ≈'+nf(K.pm)+' mm '+(K.pmsrc==='ficha'?FS:E)+' · '+nf(K.ammo)+' '+LL2('disparos','rounds')+(K.ammosrc==='ficha'?FS:' '+E)+' · '+LL2('recarga','reload')+' '+String(K.rl).replace('.',',')+' s '+(K.auto?LL2('(cargador automático) ','(autoloader) '):'')+E+'</li>');
      if(K.atgm) li.push('<li><b>'+LL2('Misil por el cañón','Gun-launched missile')+':</b> '+X.esc(K.atgm.n.replace(/^Misil /,''))+' · ≈'+nf(K.pa)+' mm '+(K.pasrc==='ficha'?FS:E)+'</li>');
      li.push('<li><b>'+LL2('Visión y tiro','Sights and fire control')+':</b> '+(K.therm?LL2('cámara térmica','thermal sight'):LL2('sin cámara térmica','no thermal sight'))+(K.thsrc==='ficha'?FS:' '+E)+' · '+(K.fcs?LL2('dirección de tiro moderna, dispara en marcha','modern fire control, fires on the move'):LL2('dispara mejor parado','fires better when stopped'))+(K.fcssrc==='ficha'?FS:' '+E)+'</li>'); }
    if(MODE==='mar') li.push('<li><b>'+LL2('Desplazamiento','Displacement')+':</b> '+(a.desp?a.desp.toLocaleString('es-ES')+' t ('+LL2('ficha','data sheet')+')':'— '+E)+(CIWS.test(armTxt(a))?' · CIWS':'')+(SAM.test(armTxt(a))?' · '+LL2('misiles antiaéreos','SAMs'):'')+'</li>');
    W.forEach(function(w){ var r=wRange(w); li.push('<li>'+X.esc(wN(w.n))+': '+(r.src==='ficha'?r.km.toLocaleString('es-ES')+' km ('+LL2('ficha de ','data sheet: ')+'<a href="#/a/'+w.arm.id+'">'+X.esc(w.arm.n)+'</a>)':r.km.toLocaleString('es-ES')+' km '+E)+'</li>'); });
    return '<div class="d2-side"><h3>'+col+' '+X.esc(a.n)+'</h3><ul>'+li.join('')+'</ul></div>'; }
  var h=X.crumbs([[LL2('Inicio','Home'),'#/'],[LL2('Juegos','Games'),'#/juegos'],[LL2('Duelo','Duel')]])+'<div data-noi18n><h1>'+LL2('Duelo','Duel')+'</h1><p class="sub">'+LL2('Dos modelos de M.A.T frente a frente, vistos desde arriba: el azul contra el rojo. Los datos salen de cada ficha; lo que la ficha no da está marcado como «Estimación». Es un juego, no una predicción.','Two M.A.T models face to face, seen from above: blue against red. The figures come from each data sheet; anything the sheet does not give is marked “Estimate”. It is a game, not a prediction.')+'</p>';
  h+='<div class="d2-chips" id="dmode">'+['cielo','suelo','mar'].map(function(k){ if(!DUELO_LIVE[k]) return '<button class="d2-chip" disabled style="opacity:.55;cursor:default">'+LL2(MN2[k][0],MN2[k][1])+' · '+LL2('próximamente','coming soon')+'</button>'; return '<button class="d2-chip" data-m="'+k+'" aria-pressed="'+(k===MODE)+'">'+LL2(MN2[k][0],MN2[k][1])+'</button>';}).join('')+'</div><p class="note" style="margin:2px 0 8px">'+LL2(MD2[MODE][0],MD2[MODE][1])+'</p></div>';
  if(MODE!=='cielo') h+='<div class="d2-chips" id="dtime" data-noi18n>'+[['dia',LL2('Día','Day')],['noche',LL2('Noche','Night')]].map(function(q){return '<button class="d2-chip" data-t="'+q[0]+'" aria-pressed="'+((q[0]==='noche')===NIGHT)+'">'+q[1]+'</button>';}).join('')+'</div><p class="note" style="margin:0 0 8px">'+(MODE==='mar'?(NIGHT?LL2('De noche el radar ve igual que de día; los buques sin radar solo ven a unos 8 km. Estimación.','At night radar sees as well as by day; ships without radar only see about 8 km. Estimate.'):LL2('De día los buques con radar detectan hasta el horizonte de radar; uno con helicóptero embarcado ve mucho más lejos. Estimación.','By day ships with radar detect out to the radar horizon; one with an embarked helicopter sees much further. Estimate.')):NIGHT?LL2('De noche solo ven lejos los carros con cámara térmica (si la ficha no lo dice, de 1980 en adelante): unos 3 km; sin ella, unos 700 m. Estimación.','At night only tanks with a thermal sight see far (if the data sheet does not say, from 1980 onwards): about 3 km; without one, about 700 m. Estimate.'):LL2('De día se detectan a unos 3,5 km si nada tapa la línea de visión (colinas, casas, bosques o humo). Estimación.','By day they spot each other at about 3.5 km if nothing blocks the line of sight (hills, houses, woods or smoke). Estimate.'))+'</p>';
  if(!DUELO_LIVE[MODE]){ h+='<div class="d2-card" data-noi18n><p style="margin:0 0 6px"><b>'+LL2(MN2[MODE][0],MN2[MODE][1])+': '+LL2('próximamente','coming soon')+'</b></p><p class="note" style="margin:0 0 10px">'+LL2('Primero sale el duelo aéreo; tierra (carros de combate) y mar llegan en las próximas versiones.','The air duel comes first; ground (main battle tanks) and sea arrive in the next versions.')+'</p><a class="d2-btn" href="#/duelo?m=cielo">'+LL2('Ir al duelo aéreo','Go to the air duel')+'</a></div>'; X.set(h,LL2('Duelo','Duel')); Array.prototype.forEach.call(document.querySelectorAll('#dmode .d2-chip[data-m]'),function(b){b.addEventListener('click',function(){location.hash='#/duelo?m='+b.getAttribute('data-m');});}); return; }
  h+='<div class="cmp">'+X.pickBtn('a',A,LL2('🔵 Elegir modelo azul','🔵 Pick the blue model'))+X.pickBtn('b',B,LL2('🔴 Elegir modelo rojo','🔴 Pick the red model'))+'</div>';
  if(A||B) h+='<div class="d2-card" data-noi18n><div class="d2-two">'+side(A,WA,'🔵')+side(B,WB,'🔴')+'</div><p class="note" style="margin:8px 0 0">'+LL2('Munición, cadencia, probabilidad de impacto y daño: reglas del juego de M.A.T (estimación). Los alcances con enlace salen de la ficha de Armamento del arma.','Ammunition, rate of fire, hit chance and damage: M.A.T game rules (estimate). Ranges with a link come from the weapon’s Armament data sheet.')+'</p></div>';
  h+='<div class="btns" data-noi18n><button class="btn pri" id="dgo"'+(A&&B?'':' disabled')+'>'+LL2('⚔️ Combatir','⚔️ Fight')+'</button>'+(A?'<button class="btn" id="drr">'+LL2('Rival aleatorio','Random rival')+'</button>':'')+'<button class="btn" id="drand">'+LL2('Los dos al azar','Both at random')+'</button></div>';
  h+='<div id="dfight"></div>';
  X.set(h,LL2('Duelo','Duel'));
  Array.prototype.forEach.call(document.querySelectorAll('#dmode .d2-chip'),function(b){b.addEventListener('click',function(){location.hash='#/duelo?m='+b.getAttribute('data-m');});});
  Array.prototype.forEach.call(document.querySelectorAll('#dtime .d2-chip'),function(b){b.addEventListener('click',function(){var oo=X.qs(); oo.t=b.getAttribute('data-t'); oo.m=MODE; delete oo.go; location.hash=X.hashFor('#/duelo',oo);});});
  Array.prototype.forEach.call(document.querySelectorAll('.pkbtn'),function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-k'); X.openPicker(okc,LL2('Elegir modelo','Pick a model'),function(id){var oo=X.qs();oo[k]=id;delete oo.s;oo.m=MODE;location.hash=X.hashFor('#/duelo',oo);});});});
  var rr_=document.getElementById('drr'); if(rr_) rr_.addEventListener('click',function(){var L=X.I.filter(okc).filter(function(x){return x!==A;}); var b=L[Math.floor(Math.random()*L.length)]; location.hash='#/duelo?m='+MODE+'&a='+A.id+'&b='+b.id;});
  document.getElementById('drand').addEventListener('click',function(){var L=X.I.filter(okc);var a=L[Math.floor(Math.random()*L.length)],b;do{b=L[Math.floor(Math.random()*L.length)];}while(b===a);location.hash='#/duelo?m='+MODE+'&a='+a.id+'&b='+b.id;});
  var raf=0, dead=false; D2ACTIVE=function(){ dead=true; cancelAnimationFrame(raf); };
  function fight(sd){ cancelAnimationFrame(raf); dead=false; seed=sd; var box=document.getElementById('dfight'); if(!box) return;
    var S=MODE==='cielo'?AIRsim(A,B,WA,WB,seed):MODE==='suelo'?GNDsim(A,B,WA,WB,seed,NIGHT):MARsim(A,B,WA,WB,seed,NIGHT); var speed=1;
    box.innerHTML='<div class="d2-card" data-noi18n><div class="d2-stage" id="dstage"><canvas id="dcv"></canvas>'+''+'<div class="d2-tools"><button type="button" id="dsp">×1</button><button type="button" id="dskip">'+LL2('⏭ Saltar','⏭ Skip')+'</button></div></div>'+'<div class="d2-ahud" id="dhud"></div>'+'<p class="note" style="margin:4px 0">'+(MODE==='mar'?LL2('Tiempo acelerado: muy rápido mientras navegan, más lento con misiles en el aire. Círculo discontinuo: alcance de sus misiles antibuque (ficha); punteado: hasta dónde detecta al rival. Blanco: misil antibuque; celeste: misil antiaéreo; nube gris: chaff.','Time sped up: very fast while sailing, slower with missiles in the air. Dashed circle: range of its anti-ship missiles (data sheet); dotted: how far it detects the rival. White: anti-ship missile; light blue: SAM; grey cloud: chaff.'):MODE==='cielo'?LL2('Tiempo acelerado: ×8 cuando están lejos, ×2 en el combate cerrado. Círculo discontinuo: alcance del misil de más alcance que le queda (ficha); punteado: cañón. Estela blanca: misil.','Time sped up: ×8 when far apart, ×2 in the close fight. Dashed circle: range of its longest-range missile left (data sheet); dotted: gun. White trail: missile.'):LL2('Tiempo acelerado ×'+TSC[MODE]+'. Círculo discontinuo: alcance del arma de más alcance que le queda.','Time sped up ×'+TSC[MODE]+'. Dashed circle: range of its longest-range weapon left.'))+' '+(function(){ var sp=MODE==='cielo'?[A,B].map(function(a){return sprOf(a).own;}):null; var gen=MODE==='cielo'?(sp[0]&&sp[1]?'':LL2(' Si un avión no tiene silueta propia, se usa la de su clase.',' An aircraft without its own silhouette uses its class silhouette.')):LL2(' Silueta según su clase.',' Silhouette by class.'); return LL2('Siluetas: modelo aproximado hecho por MAT a partir de medidas oficiales.','Silhouettes: approximate model made by MAT from official dimensions.')+gen; })()+'</p><ul class="d2-log" id="dlog"></ul></div><div id="dres"></div>';
    var cv=document.getElementById('dcv'), V=MODE==='cielo'?AIRview(cv,S):MODE==='suelo'?GNDview(cv,S):MARview(cv,S), logEl=document.getElementById('dlog'), nL=0, last=performance.now(), acc=0, shown=false, endT=0;
    function hud(){ if(S.hud){ var hh=S.hud(); document.getElementById('dhud').innerHTML=hh.map(function(x){return '<div class="d2-ah '+(x.c?'r':'b')+'"><b>'+(x.c?'🔴 ':'🔵 ')+X.esc(x.n)+'</b> · '+x.hp+' %'+(x.fuel!=null?' · '+LL2('combustible ','fuel ')+x.fuel+' %':'')+'<br><span>'+X.esc(x.txt)+'</span></div>';}).join(''); } else document.getElementById('dhud').textContent='🔵 '+Math.round(S.U[0].hp*100)+' %  ·  🔴 '+Math.round(S.U[1].hp*100)+' %  ·  '+fmtD(Math.hypot(S.U[1].x-S.U[0].x,S.U[1].y-S.U[0].y))+'  ·  '+Math.floor(S.T/60)+':'+String(Math.floor(S.T%60)).padStart(2,'0');
      while(nL<S.ev.length){ var e=S.ev[nL++]; var li=document.createElement('li'); li.className=e.cls; li.textContent=tF(e.t)+' · '+(LGE()?e.en:e.es); logEl.insertBefore(li,logEl.firstChild); } }
    function frame(now){ if(dead) return; var dt=Math.min(0.1,(now-last)/1000); last=now; acc+=dt*TSC[MODE]*speed*(S.tsc?S.tsc():1); var n=0; while(acc>=0.05&&n<400&&!S.over){ S.step(0.05); acc-=0.05; n++; } if(MODE==='mar'&&acc>0.5) acc=0.5; if(S.over&&S.post) S.post(dt*2); V.draw(); hud(); if(S.over&&!shown){ if(!endT) endT=now; if(now-endT>1500){ shown=true; result(); } } raf=requestAnimationFrame(frame); }
    document.getElementById('dsp').addEventListener('click',function(e){ speed=speed===1?2:speed===2?4:1; e.target.textContent='×'+speed; });
    document.getElementById('dskip').addEventListener('click',function(){ var n=0; while(!S.over&&n++<60000) S.step(0.05); endT=performance.now()-2000; });
    var onR=function(){ V.layout(); }; window.addEventListener('resize',onR); var prevD=D2ACTIVE; D2ACTIVE=function(){ dead=true; cancelAnimationFrame(raf); window.removeEventListener('resize',onR); };
    window.MAT_DUELO_DBG={S:S,V:V,setSpeed:function(v){speed=v;}};
    try{ box.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){}
    raf=requestAnimationFrame(frame);
    function result(){ var w=S.over.w, U=S.U, win=U[w], los_=U[1-w], st=S.st; var R_=[]; if(S.reasons){ R_=S.reasons.slice(); } else {
      if(S.first!=null){ var f=U[S.first], fw=S.firstW; R_.push(LL2(f.a.n+' dispara primero, a '+fmtD(S.firstD)+', con '+(fw.w.arm?fw.w.arm.n:fw.w.n)+' ('+fw.km.toLocaleString('es-ES')+' km de alcance'+(fw.src==='ficha'?' según su ficha':', estimación')+')',f.a.n+' fires first, at '+fmtD(S.firstD)+', with '+(fw.w.arm?fw.w.arm.n:fw.w.n)+' ('+fw.km.toLocaleString('en-GB')+' km range'+(fw.src==='ficha'?' from its data sheet':', estimate')+')')); }
      [0,1].forEach(function(i){ var x=st[i], u=U[i]; if(!x.sh) { R_.push(LL2(u.a.n+' no llega a disparar: nunca tuvo al rival a su alcance o a la vista',u.a.n+' never fires: the rival was never in range or in sight')); return; }
        R_.push(LL2(u.a.n+': '+x.hit+' de '+x.sh+(x.sh===1?' disparo alcanza':' disparos alcanzan'),u.a.n+': '+x.hit+' of '+x.sh+' shots hit')+(MODE==='suelo'&&x.hit?LL2(', '+(x.pen===0?'ninguno perfora':x.pen===1?'1 perfora':x.pen+' perforan'),', '+x.pen+' penetrate')+(x.zones.lateral||x.zones.trasera?LL2(' (por el lateral o la trasera, de blindaje menor)',' (through the side or rear, thinner armour)'):''):''));
        if(x.dodge) R_.push(LL2(U[1-i].a.n+' esquivó '+x.dodge+' misil'+(x.dodge>1?'es':'')+' con giros bruscos'+(U[1-i].fl>=0&&era(U[1-i].a)>1965?' y bengalas':''),U[1-i].a.n+' dodged '+x.dodge+' missile'+(x.dodge>1?'s':'')+' with hard turns'+(era(U[1-i].a)>1965?' and flares':'')));
        if(x.ciws) R_.push(LL2('Las defensas de '+U[1-i].a.n+' derribaron '+x.ciws+' misil'+(x.ciws>1?'es':''),U[1-i].a.n+'’s defences shot down '+x.ciws+' missile'+(x.ciws>1?'s':''))); });
      if(MODE==='suelo'&&(U[0].hullT||U[1].hull)) {}
      if(MODE==='suelo'&&S.ev.some(function(e){return /desenfilada/.test(e.es);})) R_.push(LL2('Desde una posición desenfilada solo asoma la torre: es más difícil de alcanzar (×0,6, regla del juego) y siempre por el frente','From a hull-down position only the turret shows: harder to hit (×0.6, game rule) and always on the front'));
      }
      var wn=S.mode==='mar'?win.sn:win.a.n; var hd=S.over.how==='ko'?LL2('🏆 Gana el '+wn,'🏆 The '+wn+' wins'):LL2('🏆 Gana a los puntos el '+wn,'🏆 The '+wn+' wins on points');
      var el=document.getElementById('dres'); el.innerHTML='<div class="d2-card" data-noi18n><h2 style="margin:0 0 4px">'+X.esc(hd)+'</h2><p class="note">'+X.esc(LL2(MN2[MODE][0],MN2[MODE][1]))+' · '+tF(S.T)+' · '+LL2('semilla ','seed ')+seed+'</p><h3 style="font-size:14px;margin:8px 0 4px">'+LL2('Por qué','Why')+'</h3><ol style="padding-left:20px;margin:0">'+R_.map(function(r){return '<li style="margin:4px 0">'+X.esc(r)+'</li>';}).join('')+'</ol>'+
        '<div style="margin-top:10px"><button class="d2-btn" id="drev">'+LL2('🔁 Revancha','🔁 Rematch')+'</button><button class="d2-btn sec" id="drep">'+LL2('Repetir (misma semilla)','Replay (same seed)')+'</button><button class="d2-btn sec" id="dsw">'+LL2('Cambiar de lado','Swap sides')+'</button><button class="d2-btn sec" id="dsh">'+LL2('🔗 Compartir','🔗 Share')+'</button></div><p class="note" id="dshm" hidden></p></div>';
      document.getElementById('drev').onclick=function(){fight(1+Math.floor(Math.random()*99999));}; document.getElementById('drep').onclick=function(){fight(seed);};
      document.getElementById('dsw').onclick=function(){location.hash='#/duelo?m='+MODE+'&a='+B.id+'&b='+A.id+(MODE!=='cielo'&&NIGHT?'&t=noche':'')+'&go=1';};
      document.getElementById('dsh').onclick=function(){ var u=location.origin+location.pathname+'#/duelo?m='+MODE+'&a='+A.id+'&b='+B.id+(MODE!=='cielo'&&NIGHT?'&t=noche':'')+'&s='+seed+'&go=1'; var m=document.getElementById('dshm'); var done=function(ok){ m.hidden=false; m.innerHTML=(ok?LL2('Enlace copiado: abre este mismo duelo.','Link copied: it opens this same duel.'):LL2('Copia este enlace: abre este mismo duelo.','Copy this link: it opens this same duel.'))+'<br><input type="text" readonly value="'+X.esc(u)+'" style="width:100%;font-size:12px" onclick="this.select()">'; };
        if(navigator.share){ navigator.share({title:'M.A.T · Duelo',url:u}).catch(function(){}); return; } if(navigator.clipboard) navigator.clipboard.writeText(u).then(function(){done(true);},function(){done(false);}); else done(false); };
      try{ el.scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(e){} } }
  document.getElementById('dgo').addEventListener('click',function(){ var sd=shared?seed:1+Math.floor(Math.random()*99999); shared=false; fight(sd); });
  if(o.go==='1'&&A&&B) setTimeout(function(){ var sd=shared?seed:1+Math.floor(Math.random()*99999); shared=false; fight(sd); },300);
};
window.MAT_DUELO_OK=function(a,m){return m!=='sub'&&MCAT[m].indexOf(a.cat)>=0&&combat(a)&&(m!=='cielo'||a.cat==='aviones')&&(m!=='mar'||a.cat==='buques');};

window.MAT_DUELO_SPR={sprOf:sprOf,drawAir:drawAir,airPx:airPx,drawGnd:drawGnd,gndPx:gndPx,gndCls:gndCls,drawMar:drawMar,marPx:marPx,marCls:marCls};
window.MAT_DUELO_AIRTEST=function(A,B,seed){ var I=(window.MAT_DATA&&window.MAT_DATA.items)||[]; var WA=weaponsOf(A,'cielo').filter(function(w){return w.k!=='bomb_air';}), WB=weaponsOf(B,'cielo').filter(function(w){return w.k!=='bomb_air';}); WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,I,w.k);}); var S=AIRsim(A,B,WA,WB,seed), n=0; while(!S.over&&n++<20000) S.step(0.05); return {T:Math.round(S.T),over:S.over,pass:S.pass,ev:S.ev.map(function(e){return Math.round(e.t)+' '+e.es;}),res:S.reasons,st:S.st}; };
window.MAT_DUELO_MARTEST=function(A,B,seed,night){ var S=MARsim(A,B,[],[],seed,night), n=0; while(!S.over&&n++<80000) S.step(0.05); return {T:Math.round(S.T),D0:Math.round(S.D0),over:S.over,ev:S.ev.map(function(e){return Math.round(e.t)+' '+e.es;}),res:S.reasons,st:S.st,K:[S.U[0].K,S.U[1].K]}; };
window.MAT_DUELO_GNDTEST=function(A,B,seed,night){ var I=(window.MAT_DATA&&window.MAT_DATA.items)||[]; var WA=weaponsOf(A,'suelo'), WB=weaponsOf(B,'suelo'); WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,I,w.k);}); [A,B].forEach(function(a){if(!a.blind){var b=blindMM(a); if(b) a.blind=b;}}); var S=GNDsim(A,B,WA,WB,seed,night), n=0; while(!S.over&&n++<20000) S.step(0.05); return {T:Math.round(S.T),over:S.over,houses:S.map.houses.length,ev:S.ev.map(function(e){return Math.round(e.t)+' '+e.es;}),res:S.reasons,st:S.st}; };
window.MAT_DUELO_API={ok:function(a,m){return window.MAT_DUELO_OK(a,m);},
 score:function(a,m){var s=(a.anio||1900)+(parseFloat(a.gen)||0)*8; if(m==='cielo'&&a.cat==='aviones'&&a.tipo==='caza') s+=15; if(m==='suelo'){ if(a.cat==='tanques') s+=15+(a.cal||0)/10;} if(m==='mar'||m==='sub') s+=Math.log(a.desp||500)*6; return s;},
 run:function(mode,A,B,N){ var I=(window.MAT_DATA&&window.MAT_DATA.items)||[]; var WA=weaponsOf(A,mode), WB=weaponsOf(B,mode); WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,I,w.k);}); if(mode==='suelo'){[A,B].forEach(function(a){if(!a.blind){var b=blindMM(a); if(b) a.blind=b;}});}
   var F=factors(mode,A,B), w=0; for(var i=0;i<N;i++){ if(simulate(mode,A,B,WA[0],WB[0],F.bias).win===0) w++; } return {pa:w/N,wa:WA[0],wb:WB[0]}; }};
})();
