
(function(){
"use strict";
// ======================= M.A.T · DUELO v2 =======================
var MCAT={cielo:['aviones','helicopteros'],suelo:['tanques','blindados'],mar:['buques'],sub:['submarinos']};
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
function rxs(s,r){var t=String(s||''),best=null; var g=new RegExp(r.source,'gi'),m; while((m=g.exec(t))){ if(!/^(antibuque|anti-?ship|antitanque|anti-?tank|ATGM)$/i.test(m[0])) return /-$/.test(m[0])?ext(t,m):m[0]; if(!best) best=m[0]; if(g.lastIndex===m.index) g.lastIndex++;} return best;}
function linesOf(a){var F=a.F||{}; var L=[]; (a.arm||[]).forEach(function(x){L.push(x);}); [F.arm_principal,F.arm_secundario].forEach(function(x){if(x) String(x).split(/;|·|\n/).forEach(function(y){if(y.trim()) L.push(y.trim());});}); return L;}
function short(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>(n||60)?s.slice(0,(n||60)-1)+'…':s;}
var AAM_BVR=/AIM-120|AMRAAM|Meteor|R-77|RVV-AE|R-27|PL-1[25]|PL-21|AIM-7|Sparrow|Skyflash|MICA|Derby|AIM-54|Phoenix|R-33|R-37|R-40|Super 530|R\.530|Aspide|Astra|AAM-4|K-100|Fakour|R-23|R-24|Matra 530/i;
var AAM_WVR=/AIM-9|Sidewinder|R-73|R-60|IRIS-T|Python|ASRAAM|Magic|R\.550|PL-[5789]\b|PL-10|Shafrir|AAM-3|AAM-5|K-13|R-3S|R-13|Firestreak|Red Top|Stinger|Mistral|Igla|Strela/i;
var ATGM=/Hellfire|Spike|HOT\b|TOW|Ataka|Shturm|Vikhr|Kornet|Konkurs|Fagot|Refleks|Svir|Kobra|LAHAT|MILAN|Javelin|Brimstone|Helina|Nag|HJ-\d|AKD-|Trigat|Malyutka|Sagger|Bastion|Falanga|antitanque|anti-?tank|ATGM/i;
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
    var pm=String(mun).match(/(?:penetra\w*|perforaci[oó]n|perforar|perfora\b)[^.;\d]{0,50}?(\d{2,4}(?:[.,]\d+)?)\s*mm/i); if(pm){var pv=parseFloat(pm[1].replace(',','.')); var tgt=out.filter(function(x){return x.k==='ke'||x.k==='heat';})[0]; if(tgt&&pv>=40&&pv<=1500){tgt.penmm=pv; tgt.pensrc=short(pm[0],80);}}
    var atg=lineWith(ATGM)||(ATGM.test(mun)?rx(mun,ATGM):null); if(atg) add(W('atgm','Misil '+short(rxs(atg,ATGM)||'antitanque',24),'atgm',{line:atg,tok:rxs(atg,ATGM)}));
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
    var at=lineWith(ATGM); if(at&&a.cat==='helicopteros') add(W('atgm','Misil '+short(rxs(at,ATGM),22)+' (antitanque)','atgm_air',{line:at,tok:rxs(at,ATGM)}));
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
function blindMM(a){var F=a.F||{},s=String(F.blindaje||'')+' '+String(F.proteccion||''),m,mx=0,re=/(\d{1,4}(?:[.,]\d+)?)\s*mm/g; while((m=re.exec(s))){var v=parseFloat(m[1].replace(',','.')); if(v<=1500&&v>mx) mx=v;} return mx||null;}
function armour(a){ if(a.blind) return a.blind; if(a.cat==='tanques') return era(a)>1980?500:era(a)>1960?200:era(a)>1940?80:30; return era(a)>1990?40:20; }
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
// ---------- silhouettes ----------
var SIL=null, SILP=null, IMG={};
var SILM={}, ALT={};
function loadSil(mode){ if(SILM[mode]) return SILM[mode]; SILM[mode]=(window.MAT_GET?window.MAT_GET('sil_'+mode+'.json.gz'):Promise.resolve({})).then(function(d){d=d||{}; if(d._alt){Object.assign(ALT,d._alt); delete d._alt;} SIL=Object.assign(SIL||{},d);return SIL;}).catch(function(){SIL=SIL||{};return SIL;}); return SILM[mode];}
function imgOf(a){ if(!a||!a.img||!SIL) return null; var k=a.id; if(IMG[k]) return IMG[k]; var im=new Image(); im.crossOrigin=null; im.src=ALT[a.id]||a.img.th; im.onerror=function(){if(im.src!==a.img.src) im.src=a.img.src;}; IMG[k]=im; return im;}
// ---------- drawing helpers ----------
function rr(n){return Math.random()*n;}
function terrain(x,W,H){return H*0.74+Math.sin(x/W*6.3+1)*H*0.035+Math.sin(x/W*15.7)*H*0.012;}
function mkScene(mode,W,H){var s={mode:mode,t:0,clouds:[],bub:[],m1:[],m2:[],fish:[]};
  for(var i=0;i<8;i++) s.clouds.push({x:rr(W),y:20+rr(H*0.4),r:18+rr(36),v:0.15+rr(0.5)});
  for(i=0;i<50;i++) s.bub.push({x:rr(W),y:rr(H),r:1+rr(3),v:0.3+rr(0.9)});
  for(i=0;i<=14;i++){s.m1.push(H*(0.38+rr(0.18))); s.m2.push(H*(0.5+rr(0.14)));}
  for(i=0;i<6;i++) s.fish.push({x:rr(W),y:H*0.2+rr(H*0.5),v:0.3+rr(0.6)});
  return s;}
function cloud(c,x,y,r,a){c.fillStyle='rgba(255,255,255,'+(a||0.85)+')';c.beginPath();c.arc(x,y,r,0,7);c.arc(x+r*0.9,y+r*0.15,r*0.8,0,7);c.arc(x-r*0.9,y+r*0.2,r*0.7,0,7);c.arc(x+r*0.3,y-r*0.45,r*0.7,0,7);c.fill();}
function ridge(c,pts,W,H,off,col,snow){var n=pts.length-1,step=W/(n-2);c.fillStyle=col;c.beginPath();c.moveTo(0,H);for(var i=0;i<=n;i++){var x=i*step-(off%step)-step;c.lineTo(x,pts[(i+Math.floor(off/step))%pts.length]);}c.lineTo(W,H);c.fill();
  if(snow){c.fillStyle='rgba(255,255,255,.75)';for(i=0;i<=n;i++){var x2=i*step-(off%step)-step,y=pts[(i+Math.floor(off/step))%pts.length];if(y<H*0.45){c.beginPath();c.moveTo(x2-14,y+16);c.lineTo(x2,y);c.lineTo(x2+14,y+16);c.fill();}}}}
function drawScene(c,s,W,H){var g,i,x;s.t++;
  if(s.mode==='cielo'){
    g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d4f8f');g.addColorStop(0.6,'#7fb3e3');g.addColorStop(1,'#cfe6f7');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(255,240,190,.9)';c.beginPath();c.arc(W*0.84,H*0.15,20,0,7);c.fill();
    ridge(c,s.m1,W,H,s.t*0.15,'#6c7f96',true); ridge(c,s.m2,W,H,s.t*0.35,'#4a5a4a',false);
    c.fillStyle='#3b4a33';c.beginPath();c.moveTo(0,H);for(x=0;x<=W;x+=20)c.lineTo(x,H*0.9+Math.sin((x+s.t*1.2)/60)*6);c.lineTo(W,H);c.fill();
    s.clouds.forEach(function(k){k.x-=k.v;if(k.x<-k.r*3)k.x=W+k.r*2;cloud(c,k.x,k.y,k.r,0.8);});
  } else if(s.mode==='suelo'){
    g=c.createLinearGradient(0,0,0,H*0.7);g.addColorStop(0,'#6f8fb0');g.addColorStop(1,'#d8dcd0');c.fillStyle=g;c.fillRect(0,0,W,H);
    s.clouds.forEach(function(k){k.x-=k.v*0.4;if(k.x<-k.r*3)k.x=W+k.r*2;if(k.y<H*0.35)cloud(c,k.x,k.y,k.r*0.8,0.6);});
    ridge(c,s.m1.map(function(y){return y+H*0.08;}),W,H,0,'#8a95a0',false);
    c.fillStyle='#71805a';c.beginPath();c.moveTo(0,H);for(x=0;x<=W;x+=10)c.lineTo(x,H*0.62+Math.sin(x/W*9+2)*H*0.04);c.lineTo(W,H);c.fill();
    c.fillStyle='#5b6b42';c.beginPath();c.moveTo(0,H);for(x=0;x<=W;x+=6)c.lineTo(x,terrain(x,W,H));c.lineTo(W,H);c.fill();
    c.fillStyle='rgba(0,0,0,.08)';for(i=0;i<40;i++){x=(i*97)%W;c.fillRect(x,terrain(x,W,H)+10+((i*37)%30),3,2);}
  } else if(s.mode==='mar'){
    g=c.createLinearGradient(0,0,0,H*0.55);g.addColorStop(0,'#4f7fb4');g.addColorStop(1,'#cfe2f2');c.fillStyle=g;c.fillRect(0,0,W,H*0.55);
    s.clouds.forEach(function(k){k.x-=k.v*0.5;if(k.x<-k.r*3)k.x=W+k.r*2;if(k.y<H*0.4)cloud(c,k.x,k.y*0.75,k.r*0.8,0.8);});
    c.fillStyle='#8aa0b3';c.beginPath();c.moveTo(0,H*0.55);for(x=0;x<=W*0.35;x+=10)c.lineTo(x,H*0.55-Math.max(0,Math.sin(x/(W*0.35)*3.14))*H*0.05);c.lineTo(W*0.35,H*0.55);c.fill();
    g=c.createLinearGradient(0,H*0.55,0,H);g.addColorStop(0,'#2a6f99');g.addColorStop(1,'#0b3352');c.fillStyle=g;c.fillRect(0,H*0.55,W,H*0.45);
    c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.4;for(var y=H*0.58;y<H;y+=16){c.beginPath();for(x=0;x<=W;x+=8)c.lineTo(x,y+Math.sin(x/24+s.t/14+y)*2.5);c.stroke();}
  } else {
    g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f4a78');g.addColorStop(0.6,'#082a48');g.addColorStop(1,'#03152a');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(170,215,255,.06)';for(i=0;i<5;i++){var bx=(i*W/4+s.t*0.25)%(W+200)-100;c.beginPath();c.moveTo(bx,0);c.lineTo(bx+60,0);c.lineTo(bx+170,H*0.85);c.lineTo(bx+40,H*0.85);c.fill();}
    c.fillStyle='rgba(120,170,200,.25)';s.fish.forEach(function(f){f.x-=f.v;if(f.x<-20)f.x=W+20;c.beginPath();c.ellipse(f.x,f.y,6,2.5,0,0,7);c.fill();});
    c.fillStyle='#2f2b20';c.beginPath();c.moveTo(0,H);for(x=0;x<=W;x+=16)c.lineTo(x,H*0.88+Math.sin(x/47)*9+Math.sin(x/13)*3);c.lineTo(W,H);c.fill();
    c.fillStyle='#3d3a2b';for(i=0;i<9;i++){x=(i*113)%W;c.beginPath();c.ellipse(x,H*0.9,18,9,0,0,7);c.fill();}
    s.bub.forEach(function(b){b.y-=b.v;if(b.y<0){b.y=H;b.x=rr(W);}c.strokeStyle='rgba(210,235,255,.35)';c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.stroke();});
  }
}
function unitW(mode,W,a){return W*(mode==='mar'?0.3:mode==='sub'?0.3:mode==='cielo'?(a&&a.cat==='helicopteros'?0.2:0.22):0.2);}
function drawUnit(c,u,a,mode,W,H){
  var w=unitW(mode,W,a), sil=SIL&&a&&SIL[a.id], im=imgOf(a);
  c.save(); c.translate(u.x,u.y); if(u.rot) c.rotate(u.rot); var fc=(sil&&sil[6]===-1)?-1:1; if(u.dir*fc<0) c.scale(-1,1);
  if(u.dead){c.globalAlpha=0.55;}
  if(sil&&im&&im.complete&&im.naturalWidth){
    var bw=sil[4],bh=sil[5],h=w*bh/bw; if(h>w*0.75){h=w*0.75;w=h*bw/bh;}
    var sx=im.naturalWidth/sil[0];
    c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=8;c.shadowOffsetY=3;
    c.beginPath(); for(var i=7;i<sil.length;i+=2){var px=-w/2+sil[i]/200*w, py=-h/2+sil[i+1]/200*h; if(i===7)c.moveTo(px,py); else c.lineTo(px,py);} c.closePath();
    c.fillStyle='#222';c.fill(); c.shadowColor='transparent';
    c.save(); c.clip(); c.drawImage(im,sil[2]*sx,sil[3]*sx,bw*sx,bh*sx,-w/2,-h/2,w,h); c.restore();
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.stroke();
    u.h=h; u.sp=1;
  } else { generic(c,mode,a,w); u.h=w*0.3; u.sp=0; }
  if(u.flash>0){c.globalAlpha=Math.min(0.8,u.flash/12);c.fillStyle='#fff7d0'; if(u.sp){c.fill();} else {c.beginPath();c.arc(0,0,w*0.25,0,7);c.fill();} u.flash--;}
  c.restore();
}
function generic(c,mode,a,w){c.fillStyle='#3b4148';c.strokeStyle='#d8d8d8';c.lineWidth=1;
  if(mode==='cielo'){c.beginPath();c.moveTo(w/2,0);c.lineTo(-w/2,-w*0.06);c.lineTo(-w/2,w*0.06);c.closePath();c.fill();c.beginPath();c.moveTo(w*0.05,0);c.lineTo(-w*0.2,-w*0.3);c.lineTo(-w*0.3,-w*0.3);c.lineTo(-w*0.15,0);c.lineTo(-w*0.3,w*0.3);c.lineTo(-w*0.2,w*0.3);c.fill();}
  else if(mode==='suelo'){c.fillRect(-w/2,-w*0.08,w,w*0.16);c.fillRect(-w*0.2,-w*0.2,w*0.4,w*0.12);c.fillRect(w*0.15,-w*0.17,w*0.4,w*0.04);c.fillStyle='#222';c.fillRect(-w/2,w*0.06,w,w*0.06);}
  else if(mode==='mar'){c.beginPath();c.moveTo(-w/2,-w*0.04);c.lineTo(w/2,-w*0.06);c.lineTo(w*0.42,w*0.06);c.lineTo(-w*0.45,w*0.06);c.fill();c.fillRect(-w*0.15,-w*0.16,w*0.25,w*0.11);}
  else {c.beginPath();c.ellipse(0,0,w/2,w*0.08,0,0,7);c.fill();c.fillRect(-w*0.05,-w*0.16,w*0.12,w*0.1);}
}
function boom(c,x,y,f,big){var n=big?22:12;for(var i=0;i<n;i++){var a=i/n*6.28,r=f*(big?16:10)*(1+((i*7)%5)/5);c.fillStyle=['#fff3b0','#ffb347','#ff6a2b','#7a2a12','#555'][i%5];c.globalAlpha=Math.max(0,1-f/3);c.beginPath();c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,(big?7:4)+((i*3)%5),0,7);c.fill();}c.globalAlpha=1;}
// ---------- projectiles ----------
function launch(fx,w,from,to,mode,cb){
  var k=w.k, p={k:k,x:from.x,y:from.y,x0:from.x,y0:from.y,tx:to.x,ty:to.y,t:0,cb:cb,trail:[]};
  var dist=Math.abs(to.x-from.x);
  p.dur={ke:22,ap:28,heat:32,hesh:34,he:34,gun:30,ac:20,mg:18,atgm:70,rk:55,art:70,bvr:80,wvr:55,atgm_air:60,gun_air:22,rk_air:40,bomb_air:60,ashm:90,sub_ashm:100,ashm_weak:70,torp:120,navgun:45,std:40}[k]||40;
  p.arc={art:0.45,rk:0.3,he:0.05,navgun:0.12,bomb_air:-0.2}[k]||0; p.burst=(k==='mg'||k==='ac'||k==='gun_air')?6:1;
  p.sea=(k==='torp'); p.miss=false; fx.push(p); return p;
}
function stepProj(c,p,mode,W,H){
  p.t++; var f=Math.min(1,p.t/p.dur), e=f;
  if(p.k==='bvr'||p.k==='wvr'||p.k==='atgm'||p.k==='ashm'||p.k==='sub_ashm'||p.k==='atgm_air') e=f*f*(3-2*f);
  var x=p.x0+(p.tx-p.x0)*e, y=p.y0+(p.ty-p.y0)*e-Math.sin(f*Math.PI)*Math.abs(p.tx-p.x0)*p.arc;
  if(p.k==='bvr'||p.k==='wvr') y+=Math.sin(f*9)*10*(1-f);
  if(p.k==='ashm') y=Math.min(y,(p.ty)-4+(f<0.15?(1-f/0.15)*-30:0));
  var dx=x-p.x, dy=y-p.y; p.x=x;p.y=y; p.trail.push([x,y]); if(p.trail.length>40) p.trail.shift();
  var ang=Math.atan2(dy,dx);
  // trails
  if(/bvr|wvr|atgm|ashm|rk|sub_ashm/.test(p.k)){c.strokeStyle=mode==='sub'?'rgba(220,240,255,.35)':'rgba(235,235,235,.55)';c.lineWidth=3;c.beginPath();p.trail.forEach(function(q,i){if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1]);});c.stroke();}
  if(p.k==='torp'){c.fillStyle='rgba(220,240,255,.5)';p.trail.forEach(function(q,i){if(i%3===0){c.beginPath();c.arc(q[0],q[1]-2,1.5+((i*7)%3),0,7);c.fill();}});}
  c.save();c.translate(x,y);c.rotate(ang);
  switch(p.k){
   case 'ke': c.fillStyle='#ffe28a';c.fillRect(-14,-1,22,2);c.fillStyle='#fff';c.fillRect(6,-1.5,4,3);
     if(p.t<5){c.fillStyle='#bbb';c.fillRect(-4+p.t*2,-5-p.t,3,2);c.fillRect(-4+p.t*2,3+p.t,3,2);} break;
   case 'heat': case 'hesh': case 'ap': case 'gun': case 'navgun': c.fillStyle='#ffd27a';c.beginPath();c.ellipse(0,0,6,3,0,0,7);c.fill();c.fillStyle='rgba(255,180,80,.5)';c.fillRect(-16,-1,12,2);break;
   case 'he': case 'art': c.fillStyle='#e8c070';c.beginPath();c.ellipse(0,0,6,3.5,0,0,7);c.fill();break;
   case 'mg': case 'ac': case 'gun_air': for(var i=0;i<4;i++){c.fillStyle=i%2?'#ffef9a':'#ff9b3d';c.fillRect(-i*14,-1,8,2);} break;
   case 'torp': c.fillStyle='#9aa';c.beginPath();c.ellipse(0,0,10,2.5,0,0,7);c.fill();break;
   case 'bomb_air': c.fillStyle='#555';c.beginPath();c.ellipse(0,0,7,3,0,0,7);c.fill();break;
   default: c.fillStyle='#eee';c.fillRect(-9,-2,16,4);c.fillStyle='#c33';c.fillRect(6,-2,3,4);c.fillStyle='rgba(255,170,60,.9)';c.beginPath();c.moveTo(-9,0);c.lineTo(-17-rr(6),-2);c.lineTo(-17-rr(6),2);c.fill();
  }
  c.restore();
  return f>=1;
}
// ---------- links to Armamento ----------
var ARMI=null;
function reEsc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
var WT={bvr:['w_aam'],wvr:['w_aam'],atgm:['w_atgm'],atgm_air:['w_atgm'],ashm:['w_ashm','w_cm'],sub_ashm:['w_ashm','w_cm']};
function wlink(tok,I,k){ if(!tok) return null; var t=String(tok).trim(); if(t.length<3||/^(antitanque|anti-?tank|ATGM|antibuque|anti-?ship)$/i.test(t)) return null;
  if(!ARMI) ARMI=I.filter(function(x){return x.cat==='armamento';});
  var r=new RegExp('(^|[^A-Za-z0-9])'+reEsc(t).replace(/[-\s]/g,'[-\\s]?')+'(?![0-9A-Za-z])','i');
  var ty=WT[k]||null; var L0=function(r){return ARMI.filter(function(x){return (!ty||ty.indexOf(x.tipo)>=0)&&(r.test(x.n)||(x.k||[]).some(function(q){return r.test(q);}));});}; var L=L0(r); if(!L.length&&/\d[A-Za-z]+$/.test(t)){var t2=t.replace(/([0-9])[A-Za-z]+$/,'$1'); L=L0(new RegExp('(^|[^A-Za-z0-9])'+reEsc(t2).replace(/[-\s]/g,'[-\\s]?')+'(?![0-9A-Za-z])','i'));}
  L.sort(function(a,b){return ((b.img?1:0)-(a.img?1:0))||(a.n.length-b.n.length);}); return L[0]||null;}
// ---------- why one side won ----------
function nf(n){return Math.round(n).toLocaleString('es-ES');}
function explain(mode,A,B,wa,wb,sim){
  var U=[A,B],Wp=[wa,wb],out=[],st=[{s:0,h:0,p:0},{s:0,h:0,p:0}],last=null;
  sim.ev.forEach(function(e){if(e.t!=='shot') return; var x=st[e.s]; x.s++; if(e.res.hit){x.h++; if(e.res.pen) x.p++; last=e;}});
  var f=sim.ev[0].who, wf=Wp[f], wo=Wp[1-f];
  var why=rng(wf)&&rng(wo)&&rng(wf)>rng(wo)*1.3?'su '+wf.arm.n+' alcanza '+nf(rng(wf))+' km según su ficha, frente a '+nf(rng(wo))+' km del '+wo.arm.n:
    ({bvr:1,ashm:1,sub_ashm:1,art:1,rk:1,atgm:1}[wf.k]&&!{bvr:1,ashm:1,sub_ashm:1,art:1,rk:1,atgm:1}[wo.k])?'su arma ('+wf.n+') tiene más alcance que '+wo.n.toLowerCase():(era(U[f])>era(U[1-f])+5?'es más moderno ('+era(U[f])+' frente a '+era(U[1-f])+') y reacciona antes':'se adelanta en esta partida (tirada del juego)');
  out.push(U[f].n+' dispara primero: '+why+'.');
  [0,1].forEach(function(i){var x=st[i]; if(!x.s) return; var zz='';
    if(mode==='suelo'&&x.p){var zc={};sim.ev.forEach(function(e){if(e.t==='shot'&&e.s===i&&e.res.pen&&e.res.zone) zc[e.res.zone]=(zc[e.res.zone]||0)+1;}); var parts=[]; if(zc.frontal) parts.push(zc.frontal+' en el frente'); if(zc.lateral) parts.push(zc.lateral+' en el lateral, de blindaje menor'); if(zc.trasera) parts.push(zc.trasera+' en la parte trasera, de blindaje menor'); if(parts.length) zz=' ('+parts.join('; ')+')';}
    out.push(U[i].n+': '+(x.h===0?(x.s===1?'su único disparo no alcanza el blanco':'ninguno de sus '+x.s+' disparos alcanza el blanco'):x.h+' de '+x.s+(x.s===1?' disparo':' disparos')+(x.h===1?' alcanza':' alcanzan')+' el blanco')+(mode==='suelo'&&x.h?', '+(x.p===0?'ninguno perfora':x.p===1?'1 perfora':x.p+' perforan')+zz:'')+'.');});
  if(mode==='suelo'){[0,1].forEach(function(i){var s=U[i],t=U[1-i],w=Wp[i]; if(!/ke|heat|hesh|ap|atgm|gun/.test(w.k)){ if(blast(w)) out.push(w.n+' de '+s.n+' es explosivo: solo deja fuera de combate si impacta donde el blindaje de '+t.n+' es ligero (menos de 60 mm; '+(t.blind?'su ficha da '+nf(armour(t))+' mm de máximo':'estimación del juego')+'), regla del juego.'); return;} var p=pen(w,s), pe=effPen(w,s,t), a=armour(t), al=zoneArm(t,ZONES[1]), at=zoneArm(t,ZONES[2]), src=w.penmm?'según la ficha':'estimada por el juego'+(s.cal?' a partir del calibre de '+String(s.cal).replace('.',',')+' mm':'');
      var pz=pe>=a?'perfora incluso por el frente':pe>=al?'por el frente no perfora; solo perfora si impacta en el lateral (≈'+nf(al)+' mm) o en la parte trasera (≈'+nf(at)+' mm), zonas de blindaje menor estimadas por el juego':pe>=at?'no perfora ni por el frente ni por el lateral (≈'+nf(al)+' mm); solo por la parte trasera (≈'+nf(at)+' mm, estimación del juego)':'no perfora por ningún lado, ni siquiera por la parte trasera (≈'+nf(at)+' mm, estimación del juego)';
      out.push(w.n+' de '+s.n+': perforación '+src+' ≈'+nf(p)+' mm'+(pe<p?' (≈'+nf(pe)+' mm efectivos contra este blindaje)':'')+', frente a '+(t.blind?nf(a)+' mm de blindaje máximo (frontal) según la ficha de '+t.n:'un blindaje frontal estimado de '+nf(a)+' mm en '+t.n+' (la ficha no da cifra)')+': '+pz+'.');
      if(w.gen) out.push('La ficha de '+s.n+' no detalla tipos de munición: se usa munición genérica para su cañón de '+String(s.cal).replace('.',',')+' mm.');
      if(defMod(w,t)<1) out.push('La carga hueca y los misiles rinden menos contra el blindaje de un carro moderno como '+t.n+' (regla del juego).');});}
  if(mode==='cielo'){[0,1].forEach(function(i){var t=U[1-i]; if(stealthy(t)&&Wp[i].k==='bvr') out.push(t.n+' es furtivo según su ficha: los misiles de largo alcance de '+U[i].n+' aciertan menos.');});
    [0,1].forEach(function(i){if(Wp[i].k==='gun_air'&&/bvr|wvr/.test(Wp[1-i].k)) out.push(U[i].n+' combate solo con cañón: tiene que acercarse mucho, y el misil del rival dispara antes.');});}
  if(mode==='mar'||mode==='sub'){[0,1].forEach(function(i){var t=U[1-i],T=armTxt(t),w=Wp[i]; if((w.k==='ashm'||w.k==='sub_ashm')&&mode==='mar'&&(CIWS.test(T)||SAM.test(T))) out.push(t.n+' lleva defensa de punto o misiles antiaéreos ('+short(rx(T,CIWS)||rx(T,SAM),24)+'), que pueden derribar el '+(w.arm?w.arm.n:'misil')+'.');});
    if(A.desp&&B.desp){var big=A.desp>B.desp?0:1; if(U[big].desp>U[1-big].desp*1.8) out.push(U[big].n+' desplaza '+nf(U[big].desp)+' t frente a '+nf(U[1-big].desp)+' t según las fichas: el más grande aguanta más impactos.');}
    [0,1].forEach(function(i){if(Wp[i].k==='torp'&&Wp[1-i].k!=='torp') out.push('El torpedo de '+U[i].n+' golpea bajo la línea de flotación: hace más daño por impacto que '+Wp[1-i].n.toLowerCase()+' (regla del juego).');});}
  if(last) out.push('Golpe decisivo: '+U[last.s].n+' con '+Wp[last.s].n+' — '+last.res.txt+'.');
  return out;
}
// ---------- page ----------
window.MAT_DUELO_OK=function(a,m){return MCAT[m].indexOf(a.cat)>=0&&combat(a);};
window.MAT_DUELO=function(app,X){
  var o=X.qs(),A=X.BY[o.a],B=X.BY[o.b];
  if(X.ensure&&((A&&A.lz&&!A._full)||(B&&B.lz&&!B._full))){app.innerHTML='<p class="sub" style="padding:24px 0">Cargando…</p>'; return X.ensure([A,B],function(){window.MAT_DUELO(app,X);});}
  var MODE=MCAT[o.m]?o.m:(A?Object.keys(MCAT).filter(function(k){return MCAT[k].indexOf(A.cat)>=0;})[0]:'cielo')||'cielo';
  var okc=function(a){return MCAT[MODE].indexOf(a.cat)>=0&&combat(a);};
  if(A&&!okc(A)) A=null; if(B&&!okc(B)) B=null;
  var WA=A?weaponsOf(A,MODE):[], WB=B?weaponsOf(B,MODE):[];
  WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,X.I,w.k);}); if(MODE==='suelo'){[A,B].forEach(function(a){if(a&&!a.blind){var b=blindMM(a); if(b) a.blind=b;}});}
  var wa=WA.filter(function(w){return w.id===o.wa;})[0]||WA[0], wb=WB.filter(function(w){return w.id===o.wb;})[0]||WB[0];
  var h=X.crumbs([['Inicio','#/'],['Duelo']])+'<h1>Duelo</h1><p class="sub">Elige el terreno, dos modelos y el arma de cada uno. Es una simulación de juego basada en las cifras de cada ficha, no una predicción de un combate real. Solo participan modelos armados; el armamento suelto (misiles, bombas) y la logística no combaten.</p>';
  h+='<div class="chips" id="mode" role="group" aria-label="Terreno">'+Object.keys(MCAT).map(function(k){return '<button class="chip" data-m="'+k+'" aria-pressed="'+(k===MODE)+'">'+MN[k]+'</button>';}).join('')+'</div><p class="note" style="margin:4px 0 0">'+X.esc(MN[MODE])+': '+MD[MODE]+'.</p>';
  h+='<div class="cmp" style="margin-top:12px">'+X.pickBtn('a',A,'Elegir modelo A')+X.pickBtn('b',B,'Elegir modelo B')+'</div>';
  function wsel(k,a,L,cur){ if(!a) return '<div></div>'; return '<div class="wsel"><div class="cnt" style="margin:6px 0 4px">Arma de '+X.esc(a.n)+'</div><div class="chips" role="group" aria-label="Arma '+k.toUpperCase()+'">'+L.map(function(w){return '<button class="chip wchip" data-k="'+k+'" data-w="'+w.id+'" aria-pressed="'+(w===cur)+'" title="'+X.esc(w.line||'')+'">'+X.esc(w.n)+'</button>';}).join('')+'</div>'+(cur&&cur.line?'<p class="note" style="margin:2px 0 0">Ficha: «'+X.esc(short(cur.line,120))+'»</p>':'')+(cur&&cur.penmm?'<p class="note" style="margin:2px 0 0">Perforación en la ficha: «'+X.esc(cur.pensrc)+'»</p>':'')+(cur&&cur.arm?'<p class="note" style="margin:2px 0 0"><a href="#/a/'+cur.arm.id+'">Ficha en Armamento: '+X.esc(cur.arm.n)+'</a>'+(cur.arm.walc?' · alcance '+nf(cur.arm.walc)+' km':'')+'</p>':'')+'</div>';}
  if(A||B) h+='<div class="cmp wcmp">'+wsel('a',A,WA,wa)+wsel('b',B,WB,wb)+'</div>';
  h+='<p class="note" style="margin:8px 0 0"><a href="#/fuerzas?bat=1">Batalla de facciones: elige dos países o alianzas ›</a></p>';
  h+='<div class="btns"><button class="btn pri" id="go"'+(A&&B?'':' disabled')+'>Combatir</button>'+(A?'<button class="btn" id="rrand">Rival aleatorio</button>':'')+'<button class="btn" id="rand">Los dos al azar</button></div>';
  h+='<div class="rbar"><div class="chips" role="group" aria-label="Gráficos"><button class="chip rch" data-r="2d">2D</button><button class="chip rch" data-r="3d">3D</button></div><button class="chip" id="snd" aria-pressed="false">Sonido: no</button></div><div class="duelwrap" id="dw"><canvas id="cv" width="960" height="540" aria-label="Escena del duelo"></canvas><div id="d3" class="d3" hidden></div><div id="d3hud" class="d3hud" hidden></div><div id="d3ban" class="d3ban" hidden></div><div id="d3tip" class="d3tip" hidden>Arrastra para girar la cámara</div></div><p class="note" id="rnote" style="margin:4px 0 0"></p><div class="dlogw"><div class="dlogh">Registro del combate</div><div id="log" class="dlog" aria-live="polite"></div></div><div id="out"></div>';
  X.set(h,'Duelo');
  var cv=document.getElementById('cv'),c=cv.getContext('2d'),Wd=cv.width,Hd=cv.height,out=document.getElementById('out'),logEl=document.getElementById('log');
  var banner=null, scene=mkScene(MODE,Wd,Hd), fx=[], booms=[], smoke=[], mz=[], spl=[], spk=[], U=[{a:A,x:Wd*0.22,y:0,dir:1,hp:1},{a:B,x:Wd*0.78,y:0,dir:-1,hp:1}], raf, anim=null, names=null;
  function baseY(i){ if(MODE==='cielo') return Hd*(i?0.36:0.5); if(MODE==='suelo'){var x=U[i].x;return terrain(x,Wd,Hd)-((U[i].h||40)/2)+4;} if(MODE==='mar') return Hd*0.56-((U[i].h||30)/2)+6; return Hd*(i?0.42:0.6);}
  loadSil(MODE);
  [A,B].forEach(function(a){imgOf(a);});
  function frame(){
    if(R3){ fx=fx.filter(function(p){var done=stepProj(c,p,MODE,Wd,Hd); if(done){p.cb&&p.cb();} return !done;}); booms=[];smoke=[];mz=[];spl=[];spk=[]; raf=requestAnimationFrame(frame); return; }
    drawScene(c,scene,Wd,Hd); var t=scene.t;
    U.forEach(function(u,i){ if(!u.a) return; var by=baseY(i); if(u.dead&&MODE!=='suelo'){u.vy=(u.vy||0)+0.15; u.fall=(u.fall||0)+u.vy; u.rot=(u.rot||0)+0.01*(i?-1:1);} 
      u.y=by+(u.fall||0)+(MODE==='cielo'&&!u.dead?Math.sin(t/35+i*2)*6:MODE==='mar'?Math.sin(t/25+i)*1.5:MODE==='sub'?Math.sin(t/40+i)*3:0);
      if(MODE==='suelo'&&!u.dead){var dx=terrain(u.x+10,Wd,Hd)-terrain(u.x-10,Wd,Hd); u.rot=Math.atan2(dx,20);} 
      if(u.y<Hd+80) drawUnit(c,u,u.a,MODE,Wd,Hd);
      if(u.dead&&t%4===0) smoke.push({x:u.x+rr(30)-15,y:u.y-5,l:60,r:6});});
    smoke=smoke.filter(function(s){s.l--;s.y-=0.7;s.r+=0.25;c.fillStyle='rgba(50,50,50,'+(s.l/120)+')';c.beginPath();c.arc(s.x,s.y,s.r,0,7);c.fill();return s.l>0;});
    mz=mz.filter(function(m){m.l--; var g=c.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r); g.addColorStop(0,'rgba(255,255,230,'+(m.l/8)+')'); g.addColorStop(0.4,'rgba(255,190,80,'+(m.l/10)+')'); g.addColorStop(1,'rgba(255,120,40,0)'); c.fillStyle=g; c.beginPath(); c.arc(m.x,m.y,m.r,0,7); c.fill(); if(MODE!=='sub'){smoke.push({x:m.x+rr(8),y:m.y-rr(6),l:22,r:3});} return m.l>0;});
    spl=spl.filter(function(s){s.f+=0.05; var hh=s.h*Math.sin(Math.min(1,s.f)*Math.PI); c.fillStyle='rgba(235,245,255,'+(0.85-s.f*0.6)+')'; c.beginPath(); c.ellipse(s.x,s.y-hh/2,8+s.f*10,hh/2+2,0,0,7); c.fill(); return s.f<1.3;});
    spk=spk.filter(function(s){s.l--; c.strokeStyle='rgba(255,230,140,'+(s.l/12)+')'; c.lineWidth=2; c.beginPath(); c.moveTo(s.x,s.y); s.x+=s.vx; s.y+=s.vy; s.vy+=0.3; c.lineTo(s.x,s.y); c.stroke(); return s.l>0;});
    fx=fx.filter(function(p){var done=stepProj(c,p,MODE,Wd,Hd); if(done){p.cb&&p.cb();} return !done;});
    booms=booms.filter(function(b){b.f+=0.12; boom(c,b.x,b.y,b.f,b.big); if(b.txt){c.font='700 22px -apple-system,Segoe UI,Roboto,sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText(b.txt,b.x,b.y-60-b.f*6);c.fillStyle=b.col||'#fff';c.fillText(b.txt,b.x,b.y-60-b.f*6);} return b.f<3.2;});
    if(names){c.font='600 18px -apple-system,Segoe UI,Roboto,sans-serif';c.textAlign='left';c.fillStyle='rgba(0,0,0,.5)';c.fillRect(12,12,Wd-24,52);
      [[0,24],[1,Wd/2+12]].forEach(function(p){var u=U[p[0]];c.fillStyle='#fff';c.fillText(short(names[p[0]],30),p[1],34);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(p[1],44,Wd/2-48,10);c.fillStyle=p[0]?'#d0605c':'#9fb06e';c.fillRect(p[1],44,(Wd/2-48)*Math.max(0,u.hp),10);});}
    if(banner){c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,78,Wd,70);c.font='800 38px -apple-system,Segoe UI,Roboto,sans-serif';c.textAlign='center';c.fillStyle='#ffd36b';c.fillText(short(banner,34),Wd/2,126);}
    raf=requestAnimationFrame(frame);
  }
  frame();
  window.addEventListener('hashchange',function stop(){cancelAnimationFrame(raf);window.removeEventListener('hashchange',stop);});

  // ---------- 3D ----------
  var R3=null, R3P=null, M3=null, d3el=document.getElementById('d3'), cvEl=document.getElementById('cv'), rnote=document.getElementById('rnote'), hudEl=document.getElementById('d3hud'), banEl=document.getElementById('d3ban'), tipEl=document.getElementById('d3tip'), sndB=document.getElementById('snd');
  var VV=(document.querySelector('script[data-v]')||{getAttribute:function(){return '';}}).getAttribute('data-v');
  function lsg(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}} function lss(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function markChips(on){Array.prototype.forEach.call(document.querySelectorAll('.rch'),function(b){b.setAttribute('aria-pressed',String((b.getAttribute('data-r')==='3d')===on));});}
  function R3hud(){ if(!R3) return; hudEl.hidden=false; hudEl.innerHTML=[0,1].map(function(i){var u=U[i];return '<div class="hh'+(i?' r':'')+'"><div class="hn">'+X.esc(short(u.a.n,28))+'</div><div class="hb"><i style="width:'+Math.max(0,Math.round(u.hp*100))+'%"></i></div></div>';}).join('');}
  function R3ban(t){ if(!t){banEl.hidden=true;return;} banEl.textContent=t; banEl.hidden=false; banEl.classList.remove('go'); void banEl.offsetWidth; banEl.classList.add('go'); }
  function stop3(){ if(R3){R3.dispose();R3=null;} R3P=null; d3el.hidden=true; hudEl.hidden=true; banEl.hidden=true; tipEl.hidden=true; cvEl.hidden=false; markChips(false); }
  function mod3(){ return import('./duelo3d.js?v='+VV).then(function(m){M3=m; return m;}); }
  function start3(explicit){
    if(!A||!B){ markChips(true); rnote.textContent='Elige los dos modelos para ver la escena en 3D.'; return; }
    rnote.textContent='Cargando escena 3D…'; markChips(true);
    R3P=Promise.all([mod3(),loadSil(MODE)]).then(function(r){ var m=r[0];
      if(!m.webglOK()){ stop3(); rnote.textContent='Este navegador no tiene WebGL: se usa 2D.'; return; }
      var mk=function(a,dir){var s=SIL&&SIL[a.id]; return {sil:s||null, img:ALT[a.id]||(a.img&&a.img.src), face:s?s[6]:1, dir:dir};};
      d3el.hidden=false; cvEl.hidden=true;
      R3=m.create(d3el,{mode:MODE,units:[mk(A,1),mk(B,-1)]});
      if(!R3){ stop3(); rnote.textContent='No se pudo iniciar el 3D: se usa 2D.'; return; }
      R3hud(); rnote.textContent=''; tipEl.hidden=false; setTimeout(function(){tipEl.hidden=true;},3500);
      if(!explicit&&!lsg('mat_r')){ setTimeout(function(){ if(!R3) return; var f=R3.fps(); if(f!=null&&f<28){ lss('mat_r_auto','2d'); stop3(); rnote.textContent='El 3D iba lento en este dispositivo ('+Math.round(f)+' fps): se usa 2D. Puedes activarlo con el botón 3D.'; } },2800); }
    }).catch(function(e){ stop3(); rnote.textContent='No se pudo cargar el 3D: se usa 2D.'; });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.rch'),function(b){b.addEventListener('click',function(){ var v=b.getAttribute('data-r'); lss('mat_r',v); if(v==='3d'){ if(!R3&&!anim) start3(true);} else { if(!anim) stop3(); } });});
  sndB.addEventListener('click',function(){ mod3().then(function(m){ m.sound.on=!m.sound.on; if(m.sound.on) m.sound.ensure(); sndB.setAttribute('aria-pressed',String(m.sound.on)); sndB.textContent='Sonido: '+(m.sound.on?'sí':'no'); }); });
  var want3=lsg('mat_r')?lsg('mat_r')==='3d':(lsg('mat_r_auto')!=='2d');
  if(want3&&A&&B&&('WebGLRenderingContext' in window)) start3(false); else markChips(false);
  window.addEventListener('hashchange',function st3(){ stop3(); window.removeEventListener('hashchange',st3); });

  function log(s){var p=document.createElement('div');p.textContent=s;logEl.appendChild(p);logEl.scrollTop=logEl.scrollHeight;}
  function fight(){
    if(!A||!B||anim) return; banner=null; if(R3){R3.reset(); R3ban(null);} out.innerHTML=''; logEl.innerHTML=''; U.forEach(function(u){u.dead=false;u.hp=1;u.fall=0;u.vy=0;u.rot=0;});
    Promise.all([loadSil(MODE),R3P]).then(function(){
      var F=factors(MODE,A,B), wins=0, N=400; for(var i=0;i<N;i++){ if(simulate(MODE,A,B,wa,wb,F.bias).win===0) wins++; }
      var sim=simulate(MODE,A,B,wa,wb,F.bias); names=[A.n,B.n]; anim=true; if(R3) R3hud();
      log((sim.ev[0].who===0?A.n:B.n)+' abre fuego primero.');
      var k=1;
      function next(){
        if(k>=sim.ev.length){ return finish(); }
        var e=sim.ev[k++], s=U[e.s], t=U[1-e.s], w=e.s===0?wa:wb, sh=e.s===0?A:B, tg=e.s===0?B:A;
        var from={x:s.x+(s.dir*unitW(MODE,Wd,s.a)*0.35),y:s.y-(MODE==='suelo'?(s.h||30)*0.2:0)}, to={x:t.x+(e.res.hit?0:(t.dir*-1)*(30+rr(40))),y:t.y+(e.res.hit?0:(MODE==='cielo'?-40-rr(40):10))};
        if(w.k==='torp'||(MODE==='sub')) {from.y=s.y+8;}
        mz.push({x:from.x,y:from.y,l:8,r:{ke:34,heat:34,hesh:34,ap:30,he:34,gun:30,art:40,navgun:36}[w.k]||18});
        var n=w.k==='mg'||w.k==='ac'||w.k==='gun_air'?3:1, left=n;
        function after(){
          if(!R3&&M3&&M3.sound.on) M3.sound.play(e.res.hit&&e.res.pen?'boom':'gun',e.hp[1-e.s]<=0);
          var txt=e.res.hit?(e.res.pen?'¡IMPACTO!':'SIN PERFORAR'):'FALLO';
          booms.push({x:to.x,y:to.y,f:0,big:e.res.hit&&e.res.pen,txt:txt,col:e.res.hit?(e.res.pen?'#ffd36b':'#cfd6dd'):'#9fb3c8'});
          if(!e.res.hit&&MODE==='mar') spl.push({x:to.x,y:Hd*0.57,h:90,f:0}); if(!e.res.hit&&MODE==='sub') for(var q=0;q<10;q++) scene.bub.push({x:to.x+rr(30)-15,y:to.y+rr(20),r:2+rr(4),v:1+rr(1.5)});
          if(e.res.hit&&!e.res.pen) for(var q2=0;q2<10;q2++) spk.push({x:to.x,y:to.y,vx:(rr(2)-1)*6,vy:-rr(6),l:12});
          if(e.res.hit&&MODE==='mar') spl.push({x:to.x+rr(20)-10,y:Hd*0.57,h:50,f:0.2});
          t.hp=e.hp[1-e.s]; if(e.res.hit) t.flash=10;
          log(sh.n+' → '+w.n+': '+e.res.txt+(e.res.hit?' ('+Math.round(Math.max(0,t.hp)*100)+' % de integridad restante en '+tg.n+')':'')+'.');
          if(R3) R3hud(); if(t.hp<=0){ t.dead=true; if(R3) R3.kill(1-e.s); booms.push({x:t.x,y:t.y,f:0,big:true}); log(tg.n+' queda fuera de combate.'); setTimeout(finish,1600); return; }
          setTimeout(next,700);}
        if(R3){ R3.shot({s:e.s,hit:e.res.hit,pen:e.res.pen,k:w.k,kill:e.hp[1-e.s]<=0},after); return; }
        for(var j=0;j<n;j++) (function(j){setTimeout(function(){launch(fx,w,from,{x:to.x+rr(16)-8,y:to.y+rr(12)-6},MODE,function(){ left--; if(left>0) return; after();});},j*120);})(j);
      }
      setTimeout(next,600);
      function finish(){ if(!anim) return; anim=null;
        var win=sim.win, Wn=win===0?A:B, Ls=win===0?B:A, pct=Math.round((win===0?wins:N-wins)/N*100);
        var dec=sim.dead?Wn.n+' deja fuera de combate a '+Ls.n+' con '+(win===0?wa:wb).n+'.':'Ninguno queda destruido; '+Wn.n+' termina con más integridad ('+Math.round(sim.hp[win]*100)+' % frente a '+Math.round(sim.hp[1-win]*100)+' %).';
        var th=function(a,wn){return '<div class="rv'+(wn?' win':'')+'">'+(a.img?'<img src="'+a.img.th+'" alt="">':window.MAT_PH(a))+'<div class="rvn">'+X.esc(a.n)+'</div><div class="rvh">'+(wn?'VENCEDOR':'Integridad '+Math.max(0,Math.round(sim.hp[a===A?0:1]*100))+' %')+'</div></div>';};
        var r='<div class="result"><div class="kicker">Resultado de esta simulación</div><div class="rvs">'+th(A,win===0)+'<div class="rvx">VS</div>'+th(B,win===1)+'</div><h2 style="margin-top:4px">Gana '+X.esc(Wn.n)+'</h2><p class="lead" style="margin:6px 0">'+X.esc(dec)+'</p>';
        var ex=explain(MODE,A,B,wa,wb,sim); r+='<h3 class="whyh">Por qué gana</h3><ul class="bul why">'+ex.map(function(s){return '<li>'+X.esc(s)+'</li>';}).join('')+'</ul>';
        r+='<p class="sub">En '+N+' combates simulados con las mismas armas, '+X.esc(Wn.n)+' gana el '+pct+' %. Cambia de munición o de arma y vuelve a combatir para ver cómo cambia.</p>';
        r+='<table class="ctab"><tbody><tr><th colspan="2">Armas elegidas</th></tr><tr><td>'+X.esc(wa.n)+'</td><td>'+X.esc(wb.n)+'</td></tr>'+F.rows.map(function(x){var w1=x.pa!=null&&x.pa>0.5,w2=x.pa!=null&&x.pa<0.5;return '<tr><th colspan="2">'+x.n+'</th></tr><tr><td class="'+(w1?'w':'')+'">'+X.esc(String(x.va))+'</td><td class="'+(w2?'w':'')+'">'+X.esc(String(x.vb))+'</td></tr>';}).join('')+'</tbody></table>';
        r+='<div class="btns" style="margin:12px 0 4px"><button class="btn pri" id="revancha">Revancha</button><button class="btn" id="swapab">Cambiar de lado</button><button class="btn" id="rrand2">Otro rival</button></div>';
        r+='<p class="note">Reglas de juego: precisión y efecto de cada tipo de munición o misil son valores de simulación; las cifras de la tabla salen de las fichas de Wikipedia. Las figuras son recortes de la fotografía de cada ficha.</p></div>';
        out.innerHTML=r; banner='GANA '+Wn.n.toUpperCase(); var rv=document.getElementById('revancha'); if(rv) rv.addEventListener('click',function(){ try{document.getElementById('dw').scrollIntoView({behavior:'smooth',block:'center'});}catch(e){} fight(); }); var sw=document.getElementById('swapab'); if(sw) sw.addEventListener('click',function(){location.hash='#/duelo?m='+MODE+'&a='+B.id+'&b='+A.id+'&wa='+wb.id+'&wb='+wa.id+'&go=1';}); var r2=document.getElementById('rrand2'); if(r2) r2.addEventListener('click',function(){var L=X.I.filter(okc).filter(function(x){return x!==A;}); var b=L[Math.floor(Math.random()*L.length)]; location.hash='#/duelo?m='+MODE+'&a='+A.id+'&b='+b.id+'&wa='+wa.id+'&go=1';}); if(R3) R3ban(banner); try{out.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
      }
    });
  }
  document.getElementById('go').addEventListener('click',fight);
  Array.prototype.forEach.call(document.querySelectorAll('#mode .chip'),function(b){b.addEventListener('click',function(){location.hash='#/duelo?m='+b.getAttribute('data-m');});});
  Array.prototype.forEach.call(document.querySelectorAll('.wchip'),function(b){b.addEventListener('click',function(){var oo=X.qs();oo['w'+b.getAttribute('data-k')]=b.getAttribute('data-w');oo.m=MODE;location.hash=X.hashFor('#/duelo',oo);});});
  var rrb=document.getElementById('rrand'); if(rrb) rrb.addEventListener('click',function(){var L=X.I.filter(okc).filter(function(x){return x!==A;}); var b=L[Math.floor(Math.random()*L.length)]; location.hash='#/duelo?m='+MODE+'&a='+A.id+'&b='+b.id+(o.wa?'&wa='+o.wa:'');});
  document.getElementById('rand').addEventListener('click',function(){var L=X.I.filter(okc);var a=L[Math.floor(Math.random()*L.length)],b;do{b=L[Math.floor(Math.random()*L.length)];}while(b===a);location.hash='#/duelo?m='+MODE+'&a='+a.id+'&b='+b.id;});
  Array.prototype.forEach.call(document.querySelectorAll('.pkbtn'),function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-k');
    X.openPicker(okc,'Elegir modelo',function(id){var oo=X.qs();oo[k]=id;delete oo['w'+k];oo.m=MODE;location.hash=X.hashFor('#/duelo',oo);});});});
  if(o.go==='1'&&A&&B) setTimeout(fight,400);
};

window.MAT_DUELO_API={ok:function(a,m){return window.MAT_DUELO_OK(a,m);},
 score:function(a,m){var s=(a.anio||1900)+(parseFloat(a.gen)||0)*8; if(m==='cielo'&&a.cat==='aviones'&&a.tipo==='caza') s+=15; if(m==='suelo'){ if(a.cat==='tanques') s+=15+(a.cal||0)/10;} if(m==='mar'||m==='sub') s+=Math.log(a.desp||500)*6; return s;},
 run:function(mode,A,B,N){ var I=(window.MAT_DATA&&window.MAT_DATA.items)||[]; var WA=weaponsOf(A,mode), WB=weaponsOf(B,mode); WA.concat(WB).forEach(function(w){if(w.tok) w.arm=wlink(w.tok,I,w.k);}); if(mode==='suelo'){[A,B].forEach(function(a){if(!a.blind){var b=blindMM(a); if(b) a.blind=b;}});}
   var F=factors(mode,A,B), w=0; for(var i=0;i<N;i++){ if(simulate(mode,A,B,WA[0],WB[0],F.bias).win===0) w++; } return {pa:w/N,wa:WA[0],wb:WB[0]}; }};
})();
