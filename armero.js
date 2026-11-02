/* M.A.T — Armero 3D (#/armero). Visor three.js con accesorios reales montables, camuflajes y materiales PBR.
   Modelos 3D de armas y parte de los accesorios: serie «Low-Poly» de GoldbergR (Sketchfab), licencia CC BY 4.0 — optimizados (meshopt) y con el origen recolocado por M.A.T.
   Accesorios marcados own:1: modelos aproximados hechos por M.A.T en código (armero_kit.js) a partir de las medidas oficiales del fabricante (fuente en cada uno).
   Iluminación: HDRI «Studio Small 09» de Poly Haven (CC0), reducido a 256×128.
   Datos del arma: fichas de Armas ligeras de M.A.T (Wikipedia). Datos de accesorios: fichas técnicas de cada fabricante (enlazadas). Nada inventado: sin dato publicado, sin cifra. */
import * as THREE from './three.module.min.js';
import {GLTFLoader,MeshoptDecoder,RoomEnvironment} from './gltf.min.js';

const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const DIR='m3d/armero/';
const SF='https://sketchfab.com/GoldbergR';
const CCBY='https://creativecommons.org/licenses/by/4.0/';
const OWNTXT=['Modelo aproximado hecho por MAT a partir de medidas oficiales','Approximate model built by MAT from official dimensions'];

/* Accesorios: datos del fabricante (o fuente indicada). g = gramos, mm = longitud. */
export const ACC={
 eotech:{f:'eotech_xps2',slot:'optic',dot:1,ay:45,n:'EOTech HWS XPS2',k:['Visor holográfico 1×','Holographic sight 1×'],g:255,mm:96.5,
   src:[['EOTech — HWS XPS2 (ficha técnica)','https://www.eotechinc.com/products/eotech-hws-xps2']],m:'https://sketchfab.com/3d-models/eotech-hws-xps2-sight-low-poly-5c8f29d9895e48e183a085fefabf0e14',mn:'EOTech HWS XPS2 Sight (Low-Poly)'},
 acog:{f:'acog_ta33',slot:'optic',n:'Trijicon ACOG TA33 (3×30)',k:['Mira de 3 aumentos, con montura','3× scope, with mount'],g:277.83,mm:157.48,
   src:[['Trijicon — ACOG 3x30 TA33-C-400383 (ficha técnica)','https://www.trijicon.com/products/details/TA33-C-400383']],m:'https://sketchfab.com/3d-models/ta33-acog-low-poly-6dad7e9976264d4cb8354c5cfe639a7e',mn:'TA33 ACOG (Low-Poly)'},
 lrt10:{f:'leupold_lrt10x40',slot:'optic',n:'Leupold Mark 4 LR/T M1 10×40 mm',k:['Visor de tirador de 10 aumentos','10× sniper scope'],g:595,mm:333,
   note:['Según Leupold, esta mira (10×40 LR/T) fue la del fusil M24 del Ejército de EE. UU.; el M110, derivado del SR-25, lleva la Mark 4 LR/T 3,5–10×40.','According to Leupold, this scope (10×40 LR/T) was the US Army M24\'s; the M110, derived from the SR-25, uses the Mark 4 LR/T 3.5–10×40.'],
   src:[['Leupold — Catálogo táctico 2006 (tabla de especificaciones)','https://www.acp-waffen.de/downloads/Produktinformationen/Leupold/2006/2006_Leupold_Tactical_Catalog.pdf'],['Leupold — 30 años de servicio de la Mark 4','https://www.leupold.com/blog/post/30-years-of-service']],m:'https://sketchfab.com/3d-models/leupold-mk-4-lrt-m1-1040mm-scope-low-poly-bf0e3597985940408d24669297d15509',mn:'Leupold Mk 4 LRT M1 10×40mm Scope (Low-Poly)'},
 mk4:{f:'leupold_mk4',slot:'optic',n:'Leupold Mark 4 LR/T M1 4,5–14×50 mm',k:['Visor de tirador de 4,5 a 14 aumentos','4.5–14× sniper scope'],g:624,mm:318,approx:1,
   note:['Según Leupold, es la mira del M107 (versión del Barrett M82 del Ejército de EE. UU.). El modelo 3D es una Leupold Mark 4 genérica: forma aproximada.','According to Leupold, this is the M107\'s scope (the US Army version of the Barrett M82). The 3D model is a generic Leupold Mark 4: approximate shape.'],
   src:[['Leupold — Catálogo táctico 2006 (tabla de especificaciones)','https://www.acp-waffen.de/downloads/Produktinformationen/Leupold/2006/2006_Leupold_Tactical_Catalog.pdf'],['Leupold — 30 años de servicio de la Mark 4','https://www.leupold.com/blog/post/30-years-of-service']],m:'https://sketchfab.com/3d-models/leupold-mark-4-scope-low-poly-f49c7d0b9613492ca19e327528d8fad0',mn:'Leupold Mark 4 Scope (Low-Poly)'},
 velos:{f:'velos_lbp556',slot:'muzzle',n:'SilencerCo Velos LBP 5.56',k:['Silenciador para 5,56 mm','5.56 mm suppressor'],g:430.9,mm:152,
   src:[['SilencerCo — Velos LBP (especificaciones: 556 = 15,2 oz, 5,98″)','https://silencerco.com/silencers/velos-lbp/']],m:'https://sketchfab.com/3d-models/silencerco-velos-lbp-556-suppressor-low-poly-f0eb0ba747d5448299ba6f82ceed169d',mn:'SilencerCo Velos LBP 5.56 Suppressor (Low-Poly)'},
 afg:{f:'magpul_afg',slot:'under',n:'Magpul AFG',k:['Empuñadura angulada','Angled fore grip'],g:82.8,mm:141,
   src:[['Magpul — AFG Angled Fore Grip (2,92 oz, 5,55″)','https://magpul.com/afg-angled-fore-grip.html']],m:'https://sketchfab.com/3d-models/magpul-afg-low-poly-7a617ccf7a244bf28f4c7bc3dbe44325',mn:'Magpul AFG (Low-Poly)'},
 m203:{f:'m203',slot:'under',n:'M203 (40 mm)',k:['Lanzagranadas bajo el cañón, montaje en raíl','Underbarrel grenade launcher, rail mount'],g:1400,barrel:305,
   src:[['Wikipedia — M203 (datos del manual FM 3-22.31 del Ejército de EE. UU.)','https://en.wikipedia.org/wiki/M203_grenade_launcher']],m:'https://sketchfab.com/3d-models/m203-grenade-launcher-rail-mounted-low-poly-782a36ecfe2e47c1bde4e7c72e02b610',mn:'M203 Grenade Launcher Rail Mounted (Low-Poly)'},
 peq15:{f:'peq15',slot:'laser',n:'AN/PEQ-15 ATPIAL',k:['Láser visible/infrarrojo e iluminador IR','Visible/IR laser and IR illuminator'],g:212.6,mm:117,
   src:[['L3Harris — AN/PEQ-15 ATPIAL (7,5 oz con pila; 11,7 cm)','https://www.l3harris.com/sites/default/files/2025-01/l3harris-an-peq-15-advanced-target-pointer-illuminator-aiming-laser-atpial-spec-sheet-ps-cs-ivs.pdf']],m:'https://sketchfab.com/3d-models/atpial-anpeq-15-low-poly-3758001408b0404592e7e80e7d5b3072',mn:'ATPIAL AN/PEQ-15 (Low-Poly)'},
 bipod:{f:'harris_sbrm',slot:'bipod',n:'Harris S-BRM 6–9″',k:['Bípode (patas de 15 a 23 cm)','Bipod (6–9 in legs)'],g:396.9,
   note:['Peso del bípode según Harris; el adaptador al raíl que se ve en el modelo no está incluido.','Bipod weight per Harris; the rail adapter seen on the model is not included.'],
   src:[['Harris Bipods — S-BRM (14 oz)','https://www.harrisbipods.com/product/s-brm-bipod/']],m:'https://sketchfab.com/3d-models/harris-bipod-low-poly-daa7dd1e247e453496974a5d252396f4',mn:'Harris Bipod (Low-Poly)'}
};

const OWN={
 "compm4":{"b": "aimpoint", "d": {"len": 135, "w": 75, "h": 82, "ay": 39}, "slot": "optic", "dot": 1, "ay": 39, "n": "Aimpoint CompM4 (M68 CCO)", "k": ["Punto rojo 1× (mira M68 del Ejército de EE. UU.)", "1× red dot (US Army M68 sight)"], "g": 376, "gn": ["con montura QRP2 y espaciador", "with QRP2 mount and spacer"], "mm": 135, "dm": {"w": 75, "h": 82}, "note": ["El Ejército de EE. UU. usa un miembro de la serie CompM4 como M68 CCO (Aimpoint; Wikipedia).", "The US Army uses a member of the CompM4 series as its M68 CCO (Aimpoint; Wikipedia)."], "src": [["Aimpoint – CompM4 2 MOA with standard spacer and QRP2 mount (specs)", "https://www.aimpoint.com/products/comp-m4-2-moa-red-dot-reflex-sight-with-standard-spacer-and-qrp2-mount/"], ["Aimpoint CompM4/CompM4s instruction manual (reproduced, sight-only dims)", "https://www.optics-trade.eu/blog/aimpoint-compm4-and-compm4s-without-mount-red-dot-sights-instruction-manual/"], ["Wikipedia – Aimpoint CompM4 (M68 CCO)", "https://en.wikipedia.org/wiki/Aimpoint_CompM4"]], "own": 1},
 "microt2":{"b": "micro", "d": {"len": 79, "w": 56, "h": 69, "ay": 39, "sl": 68}, "slot": "optic", "dot": 1, "ay": 39, "n": "Aimpoint Micro T-2", "k": ["Punto rojo compacto 1× (montura LRP alta)", "Compact 1× red dot (tall LRP mount)"], "g": 188, "gn": ["con montura LRP y espaciador de 39 mm", "with LRP mount and 39 mm spacer"], "mm": 79, "dm": {"w": 56, "h": 69}, "src": [["Aimpoint – Micro T-2 with standard mount", "https://www.aimpoint.com/products/micro-t-2-2-moa-red-dot-reflex-sight-with-standard-mount-for-weaver-picatinny/"], ["Aimpoint – Micro T-2 with 39 mm spacer and LRP mount", "https://www.aimpoint.com/products/micro-t-2-2-moa-red-dot-reflex-sight-with-39-mm-spacer-and-lrp-mount/"], ["Micro T-2 user manual (PDF)", "https://images-na.ssl-images-amazon.com/images/I/A1-yWe%2B3STS.pdf"]], "own": 1},
 "microt2l":{"b": "micro", "d": {"len": 79, "w": 46, "h": 48, "ay": 20, "sl": 68, "low": 1}, "slot": "optic", "dot": 1, "ay": 20, "n": "Aimpoint Micro T-2 (montura baja)", "k": ["Punto rojo compacto 1× (montura estándar baja)", "Compact 1× red dot (low standard mount)"], "g": 130, "gn": ["con montura estándar", "with standard mount"], "mm": 79, "dm": {"w": 46, "h": 48}, "src": [["Aimpoint – Micro T-2 with standard mount", "https://www.aimpoint.com/products/micro-t-2-2-moa-red-dot-reflex-sight-with-standard-mount-for-weaver-picatinny/"], ["Aimpoint – Micro T-2 with 39 mm spacer and LRP mount", "https://www.aimpoint.com/products/micro-t-2-2-moa-red-dot-reflex-sight-with-39-mm-spacer-and-lrp-mount/"], ["Micro T-2 user manual (PDF)", "https://images-na.ssl-images-amazon.com/images/I/A1-yWe%2B3STS.pdf"]], "own": 1},
 "hs510c":{"b": "hs510", "d": {"len": 83.8, "w": 42.7, "h": 45.2}, "slot": "optic", "dot": 1, "ay": 35.8, "n": "Holosun HS510C", "k": ["Reflex abierto 1× con panel solar", "1× open reflex with solar panel"], "g": 140, "gn": ["con montura QD integrada", "with integral QD mount"], "mm": 83.8, "dm": {"w": 42.7, "h": 45.2}, "src": [["Holosun – HS510C product page", "https://www.holosun.com/products/hs510c"]], "own": 1},
 "exps3":{"b": "eotech", "d": {"len": 96.5, "w": 58.4, "h": 73.7}, "slot": "optic", "dot": 1, "ay": 52, "n": "EOTech EXPS3", "k": ["Visor holográfico 1× (SU-231A/PEQ en EE. UU.)", "1× holographic sight (US SU-231A/PEQ)"], "g": 317.5, "mm": 96.5, "dm": {"w": 58.4, "h": 73.7}, "note": ["Base elevada 7 mm para cowitness del tercio inferior; compatible con visión nocturna.", "7 mm raised base for lower-third co-witness; night-vision compatible."], "src": [["EOTech – HWS EXPS3 (tech specs)", "https://www.eotechinc.com/products/eotech-hws-exps3"], ["Wikipedia – EOTech (SU-231A/PEQ)", "https://en.wikipedia.org/wiki/EOTech"]], "own": 1},
 "ta31":{"b": "acog", "d": {"len": 151.9, "w": 50.8, "h": 58.4, "ay": 32}, "slot": "optic", "ay": 32, "n": "Trijicon ACOG TA31F (4×32)", "k": ["Mira de 4 aumentos, fibra óptica y tritio", "4× scope, fibre optic and tritium"], "g": 422.41, "gn": ["con montura TA51", "with TA51 mount"], "mm": 151.89, "dm": {"w": 50.8, "h": 58.42}, "src": [["Trijicon – ACOG 4x32 TA31F", "https://www.trijicon.com/products/details/ta31f"], ["Trijicon – ACOG 4x32 USMC RCO TA31RCO-M4CP", "https://www.trijicon.com/products/details/ta31rco-m4cp"], ["Trijicon – ACOG TA31 (carry-handle)", "https://www.trijicon.com/products/details/ta31"], ["Wikipedia – ACOG (M150 RCO / AN/PVQ-31)", "https://en.wikipedia.org/wiki/Advanced_Combat_Optical_Gunsight"]], "own": 1},
 "ta31rmr":{"b": "acog", "d": {"len": 151.9, "w": 50.8, "h": 58.4, "ay": 32, "rmr": {"len": 45.7, "w": 27.9, "h": 25.4}}, "slot": "optic", "ay": 32, "n": "ACOG TA31RCO (M150 RCO) + Trijicon RMR", "k": ["4× con punto rojo RMR encima para corta distancia", "4× with an RMR red dot on top for close range"], "g": 456.43, "gn": ["suma de pesos publicados: 422,41 g + RMR 34,02 g", "sum of published weights: 422.41 g + RMR 34.02 g"], "mm": 151.89, "dm": {"w": 50.8, "h": 58.42}, "note": ["El TA31RCO es el M150 RCO del Ejército de EE. UU.; Trijicon indica que lleva alojamientos para montar un RMR encima.", "The TA31RCO is the US Army M150 RCO; Trijicon states it has bosses to mount an RMR on top."], "src": [["Trijicon – ACOG 4x32 TA31F", "https://www.trijicon.com/products/details/ta31f"], ["Trijicon – ACOG 4x32 USMC RCO TA31RCO-M4CP", "https://www.trijicon.com/products/details/ta31rco-m4cp"], ["Trijicon – ACOG TA31 (carry-handle)", "https://www.trijicon.com/products/details/ta31"], ["Wikipedia – ACOG (M150 RCO / AN/PVQ-31)", "https://en.wikipedia.org/wiki/Advanced_Combat_Optical_Gunsight"], ["Trijicon – RMR Type 2 RM06", "https://www.trijicon.com/products/details/rm06-c-700672"]], "own": 1},
 "specterdr":{"b": "elcan", "d": {"len": 153, "w": 68, "h": 72, "ay": 40}, "slot": "optic", "ay": 40, "n": "ELCAN SpecterDR 1×/4×", "k": ["Mira de 1 o 4 aumentos con palanca (SU-230/PVS del SOCOM)", "1× or 4× with throw lever (SOCOM SU-230/PVS)"], "g": 655, "gn": ["con montura integrada", "with integral mount"], "mm": 153, "dm": {"w": 68, "h": 72}, "src": [["Armament Technology (ELCAN distributor) – ELCAN SpecterDR 1x/4x specs", "https://armament.com/products/elcan-specterdr-1x4x"], ["Wikipedia – ELCAN Specter", "https://en.wikipedia.org/wiki/ELCAN_Specter"]], "own": 1},
 "nx8":{"b": "lpvo", "d": {"len": 222, "tube": 30, "ay": 40}, "slot": "optic", "ay": 40, "n": "Nightforce NX8 1-8×24 F1", "k": ["Visor de aumento variable 1–8× (LPVO)", "1–8× variable-power scope (LPVO)"], "g": 490, "gn": ["solo la mira; la montura del modelo es genérica y no se suma", "scope only; the mount shown is generic and not counted"], "mm": 222, "dm": {"dia": 30}, "note": ["Tubo de 30 mm. Nightforce no la vende con montura: en el modelo se ve una montura voladiza genérica.", "30 mm tube. Nightforce sells it without a mount: the model shows a generic cantilever mount."], "src": [["Nightforce – NX8 1-8x24mm F1", "https://www.nightforceoptics.com/riflescopes/nx8/nx8-1-8x24-f1"], ["Nightforce – NX8 1-8x24mm F1 Capped", "https://www.nightforceoptics.com/riflescopes/nx8/nx8-1-8x24mm-f1-capped"]], "own": 1},
 "g33":{"b": "magnifier", "d": {"len": 102, "w": 55.9, "h": 73.7, "ay": 52}, "slot": "mag", "n": "EOTech G33.STS", "k": ["Magnificador 3× abatible al lado", "3× flip-to-side magnifier"], "g": 300, "gn": ["con montura STS", "with STS mount"], "mm": 102, "dm": {"w": 55.9, "h": 73.7}, "note": ["En el modelo se coloca a la altura de la mira montada delante.", "In the model it is set at the height of the sight mounted in front."], "src": [["EOTech – G33 Magnifier (tech specs)", "https://www.eotechinc.com/products/eotech-magnifier-g33"]], "own": 1},
 "sf556rc2":{"b": "can", "d": {"len": 162, "dia": 38, "style": "sf"}, "slot": "muzzle", "n": "SureFire SOCOM556-RC2", "k": ["Silenciador de 5,56 mm (acople rápido SureFire)", "5.56 mm suppressor (SureFire fast-attach)"], "g": 482, "mm": 162, "add": 97, "dm": {"dia": 38}, "cal": ["5,56×45 mm", "5.56×45mm"], "note": ["Se desliza sobre la bocacha SureFire: alarga el arma unos 97 mm (según SureFire).", "Slides over the SureFire muzzle device: adds about 97 mm to the weapon (per SureFire)."], "src": [["SureFire – SOCOM556-RC2", "https://www.surefire.com/socom556-rc2/"]], "own": 1},
 "nt4":{"b": "can", "d": {"len": 165.1, "dia": 38.1, "style": "nt4"}, "slot": "muzzle", "n": "Knight's Armament QDSS NT4", "k": ["Silenciador de 5,56 mm (NSN del ejército de EE. UU.)", "5.56 mm suppressor (US military NSN)"], "g": 623.7, "mm": 165.1, "cal": ["5,56×45 mm", "5.56×45mm"], "note": ["KAC no publica el diámetro: en el modelo se usa un tubo de unos 38 mm.", "KAC does not publish the diameter: the model uses a tube of about 38 mm."], "src": [["KAC – 5.56mm QDSS NT4", "https://www.knightarmco.com/16373/shop/signature-reduction/rifle-suppressors/5-56mm/5-56mm-qdss-nt4"]], "own": 1},
 "rotexx556":{"b": "can", "d": {"len": 198, "dia": 39, "style": "bt"}, "slot": "muzzle", "n": "B&T Rotex-X 5.56", "k": ["Silenciador de 5,56 mm para apagallamas OTAN", "5.56 mm suppressor for NATO flash hiders"], "g": 565, "mm": 198, "add": 151, "dm": {"dia": 39}, "cal": ["5,56×45 mm", "5.56×45mm"], "note": ["Sobresale 151 mm de la boca del cañón (catálogo B&T 2024).", "Protrudes 151 mm past the muzzle (B&T 2024 catalogue)."], "src": [["B&T Suppressors Catalogue 2024 (EN, PDF)", "https://bt-ag.ch/wp-content/uploads/catalog/B&T_Catalogue_Suppressors_2024_EN.pdf"]], "own": 1},
 "sf762rc2":{"b": "can", "d": {"len": 213, "dia": 38, "style": "sf"}, "slot": "muzzle", "n": "SureFire SOCOM762-RC2", "k": ["Silenciador de 7,62 mm (acople rápido SureFire)", "7.62 mm suppressor (SureFire fast-attach)"], "g": 595, "mm": 213, "add": 149, "dm": {"dia": 38}, "cal": ["7,62×51 mm", "7.62×51mm"], "note": ["Alarga el arma unos 149 mm (según SureFire).", "Adds about 149 mm to the weapon (per SureFire)."], "src": [["SureFire – SOCOM762-RC2", "https://www.surefire.com/socom762-rc2/"]], "own": 1},
 "kac_m110":{"b": "can", "d": {"len": 355.6, "dia": 40, "style": "kac"}, "fde": 1, "slot": "muzzle", "n": "KAC M110 Suppressor", "k": ["Silenciador del M110 SASS (7,62 mm)", "M110 SASS suppressor (7.62 mm)"], "g": 907, "mm": 355.6, "add": 152, "cal": ["7,62×51 mm", "7.62×51mm"], "note": ["Muy largo porque cubre el cañón hasta el bloque de gases. Lo que alarga el arma (152 mm) sale de la longitud del M110 sin y con silenciador (Wikipedia). KAC no publica el diámetro: forma aproximada.", "Very long because it sleeves back over the barrel to the gas block. The length it adds (152 mm) comes from the M110's length without and with suppressor (Wikipedia). KAC does not publish the diameter: approximate shape."], "src": [["KAC – M110 Suppressor 7.62/.300", "https://www.knightarmco.com/13487/shop/signature-reduction/rifle-suppressors/7-62mm/m110-suppressor-7-62-300"], ["Wikipedia — M110 SASS", "https://en.wikipedia.org/wiki/M110_semi-automatic_sniper_system"]], "own": 1},
 "bt_mp7":{"b": "can", "d": {"len": 189, "dia": 39, "style": "bt"}, "slot": "muzzle", "n": "B&T MP7 LMX", "k": ["Silenciador de 4,6×30 mm para el MP7", "4.6×30mm suppressor for the MP7"], "g": 395, "mm": 189, "add": 150, "dm": {"dia": 39}, "cal": ["4,6×30 mm", "4.6×30mm"], "note": ["Cifras del catálogo B&T 2024 (B&T USA indica 340 g y 179 mm).", "Figures from the B&T 2024 catalogue (B&T USA lists 340 g and 179 mm)."], "src": [["B&T Suppressors Catalogue 2024 (EN, PDF) – MP7 LMX", "https://bt-ag.ch/wp-content/uploads/catalog/B&T_Catalogue_Suppressors_2024_EN.pdf"], ["B&T USA – MP7 LMX", "https://bt-usa.com/products/mp7-lmx/"]], "own": 1},
 "bt_smg9":{"b": "can", "d": {"len": 209, "dia": 35, "style": "bt"}, "slot": "muzzle", "n": "B&T QD 9 mm (MP5/APC)", "k": ["Silenciador de 9 mm para cañón de 3 tetones", "9 mm suppressor for 3-lug barrels"], "g": 370, "mm": 209, "add": 177, "dm": {"dia": 35}, "cal": ["9×19 mm Parabellum", "9×19mm Parabellum"], "src": [["B&T – QD 9mm suppressor operator manual (PDF)", "https://bt-ag.ch/wp-content/uploads/manuals/schalldaempfer/TM-988100-QD-9mm-EN.pdf"], ["B&T Suppressors Catalogue 2024 (EN, PDF)", "https://bt-ag.ch/wp-content/uploads/catalog/B&T_Catalogue_Suppressors_2024_EN.pdf"]], "own": 1},
 "ctr":{"b": "stock", "d": {"len": 177.8, "h": 132.1, "w": 43.2, "style": "ctr"}, "slot": "stock", "n": "Magpul CTR", "k": ["Culata telescópica con bloqueo por fricción", "Collapsible stock with friction lock"], "g": 252, "gn": ["solo la culata", "stock only"], "dm": {"w": 43.2, "h": 132.1, "l": 177.8}, "src": [["Magpul Industries – Magpul CTR Carbine Stock – Mil-Spec (MAG310)", "https://magpul.com/ctr-carbine-stock-mil-spec.html"]], "own": 1},
 "moe":{"b": "stock", "d": {"len": 177.8, "h": 132.1, "w": 43.2, "style": "moe"}, "slot": "stock", "n": "Magpul MOE Carbine", "k": ["Culata telescópica de 6 posiciones", "6-position collapsible stock"], "g": 238, "gn": ["solo la culata", "stock only"], "dm": {"w": 43.2, "h": 132.1, "l": 177.8}, "src": [["Magpul Industries – Magpul MOE Carbine Stock – Mil-Spec (MAG400)", "https://magpul.com/moe-carbine-stock-mil-spec.html"]], "own": 1},
 "slk":{"b": "stock", "d": {"len": 167.6, "h": 109.2, "w": 43.2, "style": "slk"}, "slot": "stock", "n": "Magpul MOE SL-K", "k": ["Culata telescópica compacta", "Compact collapsible stock"], "g": 221, "gn": ["solo la culata", "stock only"], "dm": {"w": 43.2, "h": 109.2, "l": 167.6}, "src": [["Magpul Industries – Magpul MOE SL-K Carbine Stock – Mil-Spec", "https://magpul.com/moe-sl-k-stock-mil-spec.html"]], "own": 1},
 "b5bravo":{"b": "stock", "d": {"len": 182.9, "h": 124.5, "w": 50.8, "style": "bravo"}, "slot": "stock", "n": "B5 Systems Bravo", "k": ["Culata telescópica con apoyo de mejilla", "Collapsible stock with cheek weld"], "g": 264, "gn": ["solo la culata", "stock only"], "dm": {"w": 50.8, "h": 124.5, "l": 182.9}, "src": [["B5 Systems – B5 Systems Bravo Stock (Mil-Spec)", "https://b5systems.com/collection/ar/bravo-stock/"]], "own": 1},
 "b5sopmod":{"b": "stock", "d": {"len": 188.7, "h": 125.2, "w": 61, "style": "sopmod"}, "slot": "stock", "n": "B5 Systems SOPMOD", "k": ["Culata SOPMOD con tubos portapilas", "SOPMOD stock with battery tubes"], "g": 335, "gn": ["solo la culata", "stock only"], "dm": {"w": 61, "h": 125.2, "l": 188.7}, "src": [["B5 Systems – B5 Systems SOPMOD, Government Issue", "https://b5systems.com/collection/ar/sopmod-government-issue/"]], "own": 1},
 "rvg":{"b": "grip", "d": {"h": 88.9, "style": "rvg"}, "slot": "under", "n": "Magpul RVG", "k": ["Empuñadura vertical", "Vertical grip"], "g": 74, "gn": ["con tornillería", "with hardware"], "dm": {"h": 88.9}, "note": ["Magpul publica la altura (3,5″) y el peso; el ancho y el largo del modelo son aproximados.", "Magpul publishes the height (3.5 in) and weight; the model's width and length are approximate."], "src": [["Magpul – RVG Rail Vertical Grip", "https://magpul.com/rvg-rail-vertical-grip.html"]], "own": 1},
 "grippod":{"b": "grip", "d": {"len": 146.1, "dia": 44.5, "style": "pod"}, "slot": "under", "n": "Grip Pod GPS-02", "k": ["Empuñadura con bípode escondido", "Foregrip with hidden bipod"], "g": 220, "mm": 146.1, "dm": {"dia": 44.5}, "note": ["Se muestra cerrado. Abierto, sus patas miden 209,6 mm de alto y 184,2 mm de ancho (fabricante).", "Shown closed. Deployed, its legs are 209.6 mm tall and 184.2 mm wide (maker)."], "src": [["Grip Pod Systems – GPS.02 Standard", "https://grippod.com/product/gps-02-standard/"]], "own": 1},
 "m600":{"b": "light", "d": {"len": 141, "bez": 28.6}, "slot": "light", "n": "SureFire M600DF Scout Light", "k": ["Linterna de arma (1.500 lúmenes)", "Weapon light (1,500 lumens)"], "g": 146, "gn": ["con baterías", "with batteries"], "mm": 141, "dm": {"dia": 28.6}, "src": [["SureFire – M600DF Scout Light", "https://www.surefire.com/m600df-scout-light-weaponlight/"]], "own": 1},
 "m340":{"b": "light", "d": {"len": 104, "bez": 29}, "slot": "light", "n": "SureFire Mini Scout Light Pro (M340C)", "k": ["Linterna compacta (sucesora de la M300)", "Compact light (M300 successor)"], "g": 103.5, "mm": 104, "dm": {"dia": 29}, "src": [["SureFire – Mini Scout Light Pro (M340C)", "https://www.surefire.com/mini-scout-light-pro/"]], "own": 1},
 "peq16":{"b": "laser", "d": {"len": 102, "w": 81, "h": 43, "style": "peq16"}, "slot": "laser", "n": "AN/PEQ-16B (MIPIM)", "k": ["Láser visible/IR, iluminador IR y linterna", "Visible/IR laser, IR illuminator and light"], "g": 281, "gn": ["con pila", "with battery"], "dm": {"w": 81, "h": 43}, "note": ["Wikipedia da dos largos (100 y 104 mm); el modelo usa 102 mm.", "Wikipedia gives two lengths (100 and 104 mm); the model uses 102 mm."], "src": [["L3Harris – MIPIM (AN/PEQ-16B)", "https://www.l3harris.com/all-capabilities/mini-integrated-pointing-illumination-module-mipim"], ["Wikipedia – AN/PEQ-16 (dims/weight)", "https://en.wikipedia.org/wiki/AN/PEQ-16"], ["USMC Instructor Guide – zero the MIPIM (AN/PEQ-16)", "https://www.trngcmd.marines.mil/Portals/207/Docs/wtbn/MPMS/0300-M16-1010_ZERO_A_MINI_INTEGRATED_POINTER_ILLUMINATOR_MODULE.pdf"]], "own": 1},
 "dbal":{"b": "laser", "d": {"len": 88.9, "w": 69.9, "h": 40.4, "style": "dbal"}, "slot": "laser", "n": "Steiner DBAL-A3", "k": ["Láser visible + IR e iluminador IR", "Visible + IR laser and IR illuminator"], "g": 218, "gn": ["con pila, tapa, montura e interruptor remoto", "with battery, cover, mount and remote switch"], "mm": 88.9, "dm": {"w": 69.9, "h": 40.4}, "src": [["Steiner – DBAL-A3", "https://www.steiner-optics.com/products/dbal-a3"]], "own": 1},
 "atlas":{"b": "atlas", "d": {"hmin": 121.9}, "slot": "bipod", "n": "Atlas BT10 V8", "k": ["Bípode de patas independientes", "Independent-leg bipod"], "g": 312, "gn": ["con abrazadera de dos tornillos", "with two-screw clamp"], "note": ["Altura 121,9–231,1 mm con las patas a 90°; se muestra con las patas recogidas.", "Height 121.9–231.1 mm with legs at 90°; shown with legs collapsed."], "src": [["Accu-Shot – BT10 V8 Atlas Bipod", "https://accu-shot.com/shop/atlas-bipods/v8-atlas-bipods/bt10-v8-atlas-bipod/"]], "own": 1},
};
Object.assign(ACC,OWN);

const SLOTS=[['optic',['Mira','Optic']],['mag',['Magnificador','Magnifier']],['muzzle',['Bocacha / silenciador','Muzzle / suppressor']],['stock',['Culata','Stock']],['under',['Bajo el cañón','Underbarrel']],['laser',['Láser (raíl superior)','Laser (top rail)']],['light',['Linterna (raíl lateral)','Light (side rail)']],['bipod',['Bípode','Bipod']]];

/* Puntos de montaje medidos sobre cada modelo (unidades del modelo; 1 mm real = 0,00118):
   top = cara superior del raíl; oz = centro de la mira; lz = láser; bore = eje del ánima; muz = inicio del silenciador (sobre la bocacha);
   uy/uz = raíl inferior (empuñadura); bz = bípode; sx/sy/sz = raíl lateral derecho (linterna); sty/stz = frente de la culata sobre el tubo; stockNode = nodo a ocultar. */
const MT={
 'm4a1':{me:0.699,top:0.137,oz:0.06,oz2:0.12,lz:0.345,bore:0.107,muz:0.655,uy:0.075,uz:0.33,sx:0.036,sy:0.107,sz:0.37,sty:0.102,stz:-0.097,stockNode:'Stock_1'},
 'scar-l':{me:0.628,top:0.160,oz:0.09,oz2:0.14,lz:0.33,bore:0.1125,muz:0.585,uy:0.086,uz:0.30,sx:0.028,sy:0.113,sz:0.35},
 'scar-h':{me:0.694,top:0.151,oz:0.09,oz2:0.14,lz:0.335,bore:0.104,muz:0.651,uy:0.077,uz:0.31,sx:0.028,sy:0.104,sz:0.35},
 'mp7a1':{me:0.299,top:0.127,oz:0.04,lz:0.17,bore:0.0755,muz:0.265,sx:0.022,sy:0.076,sz:0.17},
 'sr-25':{me:0.839,top:0.144,oz:0.13,bore:0.1155,muz:0.796,uy:0.092,bz:0.47},
 'm82a1':{me:1.281,top:0.165,oz:0.30}
};
const ADD={};   // accesorios propios añadidos a cada variante (se rellena abajo)
function mt(v){ return v.mt||MT[v.id]||{}; }

/* ===== Camuflajes (procedimentales, sin archivos de patrón; colores genéricos) ===== */
const CAMO=[
 ['orig',['De fábrica','Factory'],null],
 ['negro',['Negro','Black'],{m:1,c:[0x1d1e20]}],
 ['fde',['Tierra (FDE)','Flat Dark Earth'],{m:1,c:[0x7a6649]}],
 ['od',['Verde oliva','OD green'],{m:1,c:[0x485033]}],
 ['arido',['Árido (multiterreno)','Arid (multi-terrain)'],{m:2,c:[0x9a8763,0xc0ae86,0x6a6a43,0x584430],s:10,t:[0.54,0.57,0.62]}],
 ['selva',['Selva (woodland)','Jungle (woodland)'],{m:2,c:[0x46552f,0x5a4129,0x8b8659,0x1b1c18],s:8,t:[0.52,0.6,0.63]}],
 ['nieve',['Nieve','Snow'],{m:2,c:[0xe3e6e9,0xb9bfc5,0x868d94,0x4b5056],s:9,t:[0.55,0.63,0.68]}],
 ['urbano',['Urbano','Urban'],{m:2,c:[0x85888b,0x5a5d60,0xb1b4b7,0x2b2d2f],s:11,t:[0.53,0.58,0.62]}]
];
const hex=n=>'#'+n.toString(16).padStart(6,'0');
function sw(c){ if(!c) return 'linear-gradient(135deg,#2a2b2d 50%,#8f7a55 50%)'; if(c.m===1) return hex(c.c[0]); return 'conic-gradient('+c.c.map((x,i)=>hex(x)+' '+(i*25)+'% '+((i+1)*25)+'%').join(',')+')'; }
function mkU(){ return {uMode:{value:0},uC0:{value:new THREE.Color()},uC1:{value:new THREE.Color()},uC2:{value:new THREE.Color()},uC3:{value:new THREE.Color()},uS:{value:9},uT:{value:new THREE.Vector3(.55,.6,.65)},uInv:{value:new THREE.Matrix4()}}; }
function setU(U,id){ const c=(CAMO.find(x=>x[0]===id)||CAMO[0])[2]; if(!c){ U.uMode.value=0; return; } U.uMode.value=c.m; c.c.forEach((x,i)=>U['uC'+i].value.setHex(x)); for(let i=c.c.length;i<4;i++) U['uC'+i].value.setHex(c.c[0]); if(c.s) U.uS.value=c.s; if(c.t) U.uT.value.set(...c.t); }
const GHEAD=`varying vec3 vCP; uniform int uMode; uniform vec3 uC0,uC1,uC2,uC3; uniform float uS; uniform vec3 uT;
float h3(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return 0.55*vn(p)+0.3*vn(p*2.03+7.1)+0.15*vn(p*4.1+3.7); }
`;
const GCOL=`
if(uMode==1){ diffuseColor.rgb=uC0; } else if(uMode==2){ vec3 cp=vCP*uS; vec3 cc=uC0; if(fbm(cp)>uT.x) cc=uC1; if(fbm(cp*1.6+vec3(11.3,4.1,8.7))>uT.y) cc=uC2; if(fbm(cp*2.2+vec3(3.1,17.2,5.9))>uT.z) cc=uC3; diffuseColor.rgb=cc; }`;
function camoPatch(m,U){
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vCP;\nuniform mat4 uInv;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=(uInv*modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=GHEAD+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+GCOL)
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nif(uMode>0){ metalnessFactor=min(metalnessFactor,0.12); }')
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nif(uMode>0){ roughnessFactor=max(roughnessFactor,0.62); }'); };
  m.customProgramCacheKey=()=>'matcamo1';
}
/* Materiales PBR: los modelos traen solo color plano; M.A.T asigna metal/rugosidad por tipo de pieza. */
function pbr(c){ if(c.userData.kit) return; const col=c.color, r=col.r,g=col.g,b=col.b, mx=Math.max(r,g,b), mn=Math.min(r,g,b), lum=0.2126*r+0.7152*g+0.0722*b, sat=mx-mn, nm=c.name||'';
  if(/round|bullet|brass|casing/i.test(nm)){ c.metalness=1; c.roughness=0.3; c.userData.nocamo=1; }
  else if(c.transparent||c.opacity<1||/glass|lens/i.test(nm)){ c.userData.nocamo=1; c.roughness=Math.min(c.roughness,0.08); c.metalness=0.1; }
  else if(c.emissiveIntensity>0&&c.emissive&&(c.emissive.r+c.emissive.g+c.emissive.b)>0){ c.userData.nocamo=1; }
  else if(sat<0.05&&lum>0.2){ c.metalness=0.82; c.roughness=0.34; c.userData.nocamo=1; }          // piezas de acero (cerrojo, pasadores)
  else if(sat<0.05&&lum<0.02){ c.metalness=0.4; c.roughness=0.4; }                             // aluminio anodizado / fosfatado negro
  else if(sat<0.05){ c.metalness=0.15; c.roughness=0.55; col.multiplyScalar(0.62); }              // acabado gris oscuro -> más próximo al negro real
  else { c.metalness=0.05; c.roughness=0.64; const gr=lum; col.setRGB(gr+(r-gr)*0.55,gr+(g-gr)*0.55,gr+(b-gr)*0.55).multiplyScalar(0.82); } // polímero de color (FDE, verde): menos saturado
  c.envMapIntensity=1;
}
function prep(root,U,cache){ root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=true;
  const one=m=>{ let k=cache.get(m); if(k) return k; k=m.userData.kit?m:m.clone(); if(!m.userData.kit) pbr(k); if(!k.userData.nocamo&&!/glass|lens|reticle|ret_|dot/i.test(k.name||'')) camoPatch(k,U); cache.set(m,k); return k; };
  o.material=Array.isArray(o.material)?o.material.map(one):one(o.material); }); }

/* HDRI de estudio (Poly Haven, CC0): 256×128 RGBE sin compresión */
let ENVP=null;
function envData(){ if(!ENVP) ENVP=fetch(DIR+'env_studio.rgbe?v='+VER).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); }).then(buf=>{ const u=new Uint8Array(buf), Wd=256, H=128, f=new Uint16Array(Wd*H*4), th=THREE.DataUtils.toHalfFloat, one=th(1);
  for(let y=0;y<H;y++) for(let x=0;x<Wd;x++){ const i=(y*Wd+x)*4, o=((H-1-y)*Wd+x)*4, e=u[i+3], s=e?Math.pow(2,e-136):0; f[o]=th(u[i]*s); f[o+1]=th(u[i+1]*s); f[o+2]=th(u[i+2]*s); f[o+3]=one; }
  return f; }).catch(e=>{ ENVP=null; throw e; }); return ENVP; }

let KITP=null; const kit=()=>KITP||(KITP=import('./armero_kit.js?v='+VER).catch(e=>{ KITP=null; throw e; }));

export const W=[
{id:'m4a1',ficha:'g-m4-carbine',n:'Colt M4A1',kind:['Carabina · EE. UU. · 5,56×45 mm OTAN','Carbine · USA · 5.56×45mm NATO'],
 hideOptic:['Carry_Handle'],
 V:[{id:'m4a1',file:'m4a1',m:'https://sketchfab.com/3d-models/colt-m4a1-low-poly-82302ecfa6c148329ffe1f488ae23f1f',mn:'Colt M4A1 (Low-Poly)',lab:['M4A1 · 5,56×45 mm','M4A1 · 5.56×45mm'],w:2.92,
  st:{cal:['5,56×45 mm OTAN','5.56×45mm NATO'],peso:['2,92 kg descargada; 3,52 kg con cargador de 30 y correa','2.92 kg empty; 3.52 kg with 30-round magazine and sling'],lon:['838 mm (culata extendida); 756 mm (retraída)','838 mm (stock extended); 756 mm (retracted)'],can:['368 mm','368 mm'],cad:['700–970 disparos/min (cíclica)','700–970 rounds/min (cyclic)'],vb:['910 m/s (M855A1); 880 m/s (M855)','910 m/s (M855A1); 880 m/s (M855)'],alc:['500 m (blancos puntuales); 600 m (de área)','500 m (point targets); 600 m (area targets)'],ali:['Cargador STANAG de 30','30-round STANAG magazine']},
  acc:{optic:['eotech','acog'],muzzle:['velos'],under:['afg','m203'],laser:['peq15']},
  pl:{eotech:[0,0.137,0.06],acog:[0,0.137,0.075],velos:[0,0.107,0.655],afg:[0,0.075,0.33],m203:{p:[0,0.075,0.30],sub:{Leaf_Sight:[0,0.02,0]}},peq15:[0,0.137,0.345]}}]},
{id:'scar',ficha:'g-fn-scar',n:'FN SCAR',kind:['Fusil de asalto / de combate · Bélgica','Assault / battle rifle · Belgium'],
 V:[{id:'scar-l',file:'scar-l',m:'https://sketchfab.com/3d-models/fn-scar-l-low-poly-3eef0e192978435ba636f3d3ae54dda5',mn:'FN SCAR-L (Low-Poly)',lab:['SCAR-L · 5,56×45 mm','SCAR-L · 5.56×45mm'],w:3.29,
  st:{cal:['5,56×45 mm OTAN','5.56×45mm NATO'],peso:['3,29 kg','3.29 kg'],lon:['889 mm (culata extendida); 635 mm (plegada)','889 mm (stock extended); 635 mm (folded)'],can:['355 mm','355 mm'],cad:['650 disparos/min','650 rounds/min'],vb:['870 m/s','870 m/s'],alc:['500 m','500 m'],ali:['Cargador STANAG de 30','30-round STANAG magazine']},
  acc:{optic:['eotech','acog'],muzzle:['velos'],under:['afg'],laser:['peq15']},
  pl:{eotech:[0,0.160,0.09],acog:[0,0.160,0.10],velos:[0,0.1125,0.585],afg:[0,0.086,0.30],peq15:[0,0.160,0.33]}},
  {id:'scar-h',file:'scar-h',m:'https://sketchfab.com/3d-models/fn-scar-h-low-poly-5429d05df204438a9761ee0931209bd9',mn:'FN SCAR-H (Low-Poly)',lab:['SCAR-H · 7,62×51 mm','SCAR-H · 7.62×51mm'],w:3.58,
  st:{cal:['7,62×51 mm OTAN','7.62×51mm NATO'],peso:['3,58 kg','3.58 kg'],lon:['965 mm (culata extendida); 711 mm (plegada)','965 mm (stock extended); 711 mm (folded)'],can:['400 mm','400 mm'],cad:['550 disparos/min','550 rounds/min'],vb:['710 m/s','710 m/s'],alc:['600 m','600 m'],ali:['Cargador de 20','20-round magazine']},
  acc:{optic:['eotech','acog'],under:['afg'],laser:['peq15']},
  pl:{eotech:[0,0.151,0.09],acog:[0,0.151,0.10],afg:[0,0.077,0.31],peq15:[0,0.151,0.335]}}],
 vnote:['El SCAR existe en dos calibres oficiales: SCAR-L (5,56 mm) y SCAR-H (7,62 mm). Cada uno es su propio modelo 3D. El silenciador Velos LBP es de 5,56 mm, así que solo se ofrece en el SCAR-L.','The SCAR comes in two official calibres: SCAR-L (5.56 mm) and SCAR-H (7.62 mm), each its own 3D model. The Velos LBP suppressor is 5.56 mm, so it is only offered on the SCAR-L.']},
{id:'mp7',ficha:'g-heckler-koch-mp7',n:'HK MP7A1',kind:['Subfusil / arma de defensa personal · Alemania · 4,6×30 mm','SMG / personal defence weapon · Germany · 4.6×30mm'],
 V:[{id:'mp7a1',file:'mp7a1',m:'https://sketchfab.com/3d-models/hk-mp7a1-low-poly-3c85ff79f3c448668fe3ab72f7e48d09',mn:'HK MP7A1 (Low-Poly)',lab:['MP7A1 · 4,6×30 mm','MP7A1 · 4.6×30mm'],w:2.10,wn:['con cargador','with magazine'],
  st:{cal:['HK 4,6×30 mm','HK 4.6×30mm'],peso:['2,10 kg con cargador (MP7A1)','2.10 kg with magazine (MP7A1)'],lon:['638 mm (culata extendida); 415 mm (plegada)','638 mm (stock extended); 415 mm (collapsed)'],can:['180 mm','180 mm'],cad:['950 disparos/min','950 rounds/min'],vb:['735 m/s','735 m/s'],alc:['200 m','200 m'],ali:['Cargador de 20, 30 o 40','20-, 30- or 40-round magazine']},
  acc:{optic:['eotech'],laser:['peq15']},
  pl:{eotech:[0,0.127,0.04],peq15:{p:[-0.022,0.076,0.17],r:[0,0,Math.PI/2]}}}],
 vnote:['No hay un modelo 3D libre de un silenciador de 4,6 mm, así que no se ofrece: mejor nada que uno inventado.','There is no free 3D model of a 4.6 mm suppressor, so none is offered: better nothing than a made-up one.']},
{id:'sr-25',ficha:'g-sr-25',n:'KAC SR-25',kind:['Fusil de tirador designado · EE. UU. · 7,62×51 mm','Designated marksman rifle · USA · 7.62×51mm'],
 V:[{id:'sr-25',file:'sr-25',m:'https://sketchfab.com/3d-models/sr-25-low-poly-e66b6868673743cfaa5ede6b31d8f0cc',mn:'SR-25 (Low-Poly)',lab:['SR-25 · 7,62×51 mm','SR-25 · 7.62×51mm'],w:null,
  st:{cal:['7,62×51 mm OTAN','7.62×51mm NATO'],peso:['Match 4,88 kg; LwMatch 4,3 kg; Carbine 3,4 kg; Sporter 3,97 kg','Match 4.88 kg; LwMatch 4.3 kg; Carbine 3.4 kg; Sporter 3.97 kg'],lon:['1.118 mm','1,118 mm'],can:['610 mm (Match); 510 mm (LwMatch/Sporter); 410 mm (Carbine)','610 mm (Match); 510 mm (LwMatch/Sporter); 410 mm (Carbine)'],cad:['Semiautomático','Semi-automatic'],ali:['Cargador de 10 o 20','10- or 20-round magazine']},
  acc:{optic:['lrt10'],bipod:['bipod']},
  pl:{lrt10:[0,0.144,0.13],bipod:[0,0.092,0.47]}}],
 vnote:['Sin silenciador: no hay un modelo 3D libre de un silenciador real de 7,62 mm.','No suppressor: there is no free 3D model of a real 7.62 mm suppressor.']},
{id:'m82',ficha:'g-barrett-m82',n:'Barrett M82',kind:['Fusil antimaterial · EE. UU. · .50 BMG','Anti-materiel rifle · USA · .50 BMG'],
 V:[{id:'m82a1',file:'m82a1',m:'https://sketchfab.com/3d-models/barrett-m82-low-poly-65b629b6e75541b9b88de571aeda24fa',mn:'Barrett M82 (Low-Poly)',lab:['M82 · 12,7×99 mm (.50 BMG)','M82 · 12.7×99mm (.50 BMG)'],w:null,
  st:{cal:['.50 BMG (12,7×99 mm); también .416 Barrett','.50 BMG (12.7×99mm); also .416 Barrett'],peso:['13,5 a 14,8 kg (según versión)','13.5 to 14.8 kg (by version)'],lon:['120 a 140 cm','120 to 140 cm'],can:['51 a 74 cm','51 to 74 cm'],vb:['853 m/s','853 m/s'],alc:['1.800 m','1,800 m'],ali:['Cargador de 5 o 10','5- or 10-round magazine']},
  acc:{optic:['mk4']},
  pl:{mk4:[0,0.165,0.30]}}],
 vnote:['El bípode es parte del arma. La mira que se ofrece es la que Leupold indica para el M107.','The bipod is part of the rifle. The scope offered is the one Leupold lists for the M107.']}
];

Object.assign(ADD,{"m4a1": {"optic": ["compm4", "microt2", "hs510c", "exps3", "ta31", "ta31rmr", "specterdr", "nx8"], "mag": ["g33"], "muzzle": ["sf556rc2", "nt4", "rotexx556"], "stock": ["ctr", "moe", "slk", "b5bravo", "b5sopmod"], "under": ["rvg", "grippod"], "laser": ["peq16", "dbal"], "light": ["m600", "m340"]}, "scar-l": {"optic": ["compm4", "microt2", "hs510c", "exps3", "ta31", "specterdr", "nx8"], "mag": ["g33"], "muzzle": ["sf556rc2", "rotexx556"], "under": ["rvg", "grippod"], "laser": ["peq16", "dbal"], "light": ["m600", "m340"]}, "scar-h": {"optic": ["compm4", "microt2", "hs510c", "exps3", "ta31", "specterdr", "nx8"], "mag": ["g33"], "muzzle": ["sf762rc2"], "under": ["rvg", "grippod"], "laser": ["peq16", "dbal"], "light": ["m600", "m340"]}, "mp7a1": {"optic": ["microt2l", "hs510c", "exps3"], "muzzle": ["bt_mp7"], "light": ["m340"]}, "sr-25": {"optic": ["nx8", "ta31"], "muzzle": ["kac_m110", "sf762rc2"], "bipod": ["atlas"]}});
export const IDS={};W.forEach(w=>{IDS[w.ficha]=w.id;});
const CSS=`
.arm-hub{display:grid;grid-template-columns:1fr;gap:12px;margin:14px 0}
@media(min-width:760px){.arm-hub{grid-template-columns:1fr 1fr}}
.arm-card{display:block;border:1px solid var(--line,#2c3136);border-radius:10px;overflow:hidden;background:#15181b;color:inherit;text-decoration:none}
.arm-card img{display:block;width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;background:#22262a}
.arm-card .t{font-weight:700;padding:8px 12px 0}.arm-card .d{color:var(--dim,#9aa0a6);font-size:13px;padding:2px 12px 10px}
.arm-wrap{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:980px){.arm-wrap{grid-template-columns:minmax(0,1.55fr) minmax(300px,1fr);align-items:start}}
.arm-stage{position:relative;border-radius:10px;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#3a4046 0%,#1d2124 70%,#141618 100%);touch-action:none;user-select:none;-webkit-user-select:none}
.arm-stage canvas{display:block;width:100%;height:100%}
.arm-stage{aspect-ratio:16/11}@media(min-width:600px){.arm-stage{aspect-ratio:16/9}}
.arm-hint{position:absolute;left:10px;bottom:8px;font-size:11.5px;color:#c9cdd1;opacity:.75;pointer-events:none}
.arm-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#c9cdd1;font-size:14px}
.arm-btns{position:absolute;right:8px;top:8px;display:flex;gap:6px}
.arm-btns button{background:rgba(20,22,24,.75);color:#e8eaec;border:1px solid #444b52;border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer}
.arm-slot{margin:10px 0 0}.arm-slot .sl{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim,#9aa0a6);margin-bottom:5px}
.arm-chips{display:flex;flex-wrap:wrap;gap:6px}
.arm-chip{border:1px solid #444b52;background:#1b1f22;color:#e3e6e8;border-radius:999px;padding:6px 11px;font-size:13px;cursor:pointer;line-height:1.2;text-align:left}
.arm-chip.on{background:#d6b25e;color:#17191b;border-color:#d6b25e;font-weight:700}
.arm-chip small{display:block;font-size:10.5px;opacity:.75;font-weight:400}
.arm-stats{border:1px solid var(--line,#2c3136);border-radius:10px;padding:4px 12px;background:#15181b}
.arm-row{display:grid;grid-template-columns:118px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #262b2f;font-size:13.5px}
.arm-row:last-child{border-bottom:0}.arm-row .k{color:var(--dim,#9aa0a6)}
.arm-d{display:inline-block;margin-left:6px;color:#7fd18b;font-weight:700;font-size:12.5px}
.arm-acc{font-size:13px;margin:8px 0 0;padding:0;list-style:none}.arm-acc li{padding:6px 0;border-bottom:1px dashed #2a2f33}
.arm-src{font-size:12px;color:var(--dim,#9aa0a6)}.arm-src a{color:inherit}
.arm-sum{margin:8px 0 0;font-size:13.5px;color:#e3e6e8}.arm-sum b{color:#d6b25e}
.arm-note{font-size:12.5px;color:var(--dim,#9aa0a6);margin:8px 0}
.arm-own{font-style:normal;font-size:9.5px;font-weight:800;letter-spacing:.05em;background:#3b4a2e;color:#cfe3b0;border-radius:4px;padding:1px 4px;vertical-align:1px}
.arm-chip.on .arm-own{background:#17191b;color:#d6b25e}
.arm-chip.dis{opacity:.4;cursor:not-allowed}
.arm-sw{display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:6px;vertical-align:-2px;border:1px solid #5a6066}
.arm-tg{display:inline-flex;align-items:center;gap:6px;margin:8px 0 0;font-size:13px;color:#d5d8db;cursor:pointer}
`;

const CACHE={};
function loader(){ const l=new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder); return l; }
function getGLB(f){ if(!CACHE[f]) CACHE[f]=loader().loadAsync(DIR+f+'.glb?v='+VER).catch(e=>{ delete CACHE[f]; throw e; }); return CACHE[f]; }
const fmtKg=v=>(EN()?v.toFixed(2):v.toFixed(2).replace('.',','))+' kg';
const fmtG=v=>(v>=1000?fmtKg(v/1000):Math.round(v)+' g');
const fmtMm=v=>(EN()?String(Math.round(v*10)/10):String(Math.round(v*10)/10).replace('.',','))+' mm';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function accs(v,s){ return [...(v.acc[s]||[]),...((ADD[v.id]||{})[s]||[])].filter(a=>ACC[a]); }
function allAcc(w){ const s=new Set(); w.V.forEach(v=>SLOTS.forEach(([k])=>accs(v,k).forEach(a=>s.add(a)))); return [...s]; }
function dims(a){ const x=ACC[a], d=x.dm||{}; const p=[];
  if(x.mm) p.push(L('largo','length')+' '+fmtMm(x.mm)); if(d.l) p.push(L('largo','length')+' '+fmtMm(d.l)); if(x.add) p.push(L('añade','adds')+' '+fmtMm(x.add)); if(d.dia) p.push('Ø '+fmtMm(d.dia)); if(d.w) p.push(L('ancho','width')+' '+fmtMm(d.w)); if(d.h) p.push(L('alto','height')+' '+fmtMm(d.h));
  if(x.barrel) p.push(L('cañón','barrel')+' '+x.barrel+' mm'); return p.join(' · '); }

let ACTIVE=null;
function stop(){ if(ACTIVE){ ACTIVE.destroy(); ACTIVE=null; } }
window.addEventListener('hashchange',()=>{ if(!/^#\/armero\/./.test(location.hash)) stop(); });

function viewer(stage){
  const canvas=document.createElement('canvas'); stage.appendChild(canvas);
  let R; try{ R=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); R.setClearColor(0x000000,0); }catch(e){ return null; }
  const mob=Math.min(screen.width,screen.height)<700;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1, mob?1.5:1.75));
  R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=0.92; R.outputColorSpace=THREE.SRGBColorSpace;
  R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFShadowMap; R.shadowMap.autoUpdate=false;
  const scene=new THREE.Scene();
  const pm=new THREE.PMREMGenerator(R); let envRT=pm.fromScene(new RoomEnvironment(),0.04); scene.environment=envRT.texture; scene.environmentIntensity=0.9;
  let alive=true;
  envData().then(f=>{ if(!alive) return; const t=new THREE.DataTexture(f,256,128,THREE.RGBAFormat,THREE.HalfFloatType); t.mapping=THREE.EquirectangularReflectionMapping; t.colorSpace=THREE.LinearSRGBColorSpace; t.magFilter=t.minFilter=THREE.LinearFilter; t.needsUpdate=true;
    const rt=pm.fromEquirectangular(t); t.dispose(); envRT.dispose(); envRT=rt; scene.environment=rt.texture; scene.environmentIntensity=0.78; scene.environmentRotation.set(0,0.6,0); dirty=true; loop(); }).catch(()=>{});
  const key=new THREE.DirectionalLight(0xffffff,1.05); key.position.set(-3,5,4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xe6ecf5,0x2a2c30,0.4));
  const sun=new THREE.DirectionalLight(0xffffff,0.55); sun.castShadow=true; sun.shadow.mapSize.set(mob?512:1024,mob?512:1024); sun.shadow.bias=-0.0004; sun.shadow.radius=5; sun.shadow.blurSamples=12; sun.shadow.normalBias=0.002; scene.add(sun); scene.add(sun.target);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:0.28,transparent:true,depthWrite:false})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const cam=new THREE.PerspectiveCamera(28,1,0.01,50);
  const pivot=new THREE.Group(); scene.add(pivot); const holder=new THREE.Group(); pivot.add(holder);
  const inv=[]; // uniformes uInv que siguen al soporte
  let yaw=-1.4, pitch=0.14, dist=2, fitD=2, auto=true, idleT=0, dirty=true, raf=0, visible=true, last=performance.now();
  function size(){ const w=stage.clientWidth||360, h=stage.clientHeight||270; R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); dirty=true; }
  const ro=new ResizeObserver(size); ro.observe(stage); size();
  const io=new IntersectionObserver(es=>{ visible=es[0].isIntersecting; if(visible) loop(); },{threshold:0.01}); io.observe(stage);
  function place(){ cam.position.set(Math.sin(yaw)*Math.cos(pitch)*dist, Math.sin(pitch)*dist, Math.cos(yaw)*Math.cos(pitch)*dist); cam.lookAt(0,0,0); }
  function loop(){
    if(!alive||raf) return; raf=requestAnimationFrame(t=>{ raf=0; if(!alive) return; const dt=Math.min(0.05,(t-last)/1000); last=t;
      if(auto){ idleT+=dt; if(idleT>3.5){ yaw+=dt*0.35; dirty=true; } }
      if(dirty){ place(); R.render(scene,cam); dirty=false; }
      if(visible&&!document.hidden&&(auto||dirty)) loop(); }); }
  const P=new Map(); let pd0=0, d0=0;
  stage.addEventListener('pointerdown',e=>{ stage.setPointerCapture&&stage.setPointerCapture(e.pointerId); P.set(e.pointerId,{x:e.clientX,y:e.clientY}); idleT=0; if(P.size===2){ const a=[...P.values()]; pd0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); d0=dist; } });
  stage.addEventListener('pointermove',e=>{ const p=P.get(e.pointerId); if(!p) return; idleT=0;
     if(P.size===1){ yaw-=(e.clientX-p.x)*0.009; pitch=Math.max(-0.7,Math.min(0.9,pitch+(e.clientY-p.y)*0.006)); }
     p.x=e.clientX; p.y=e.clientY;
     if(P.size===2&&pd0){ const a=[...P.values()]; const pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); dist=Math.max(fitD*0.35,Math.min(fitD*1.8,d0*pd0/pd)); }
     dirty=true; loop(); });
  const up=e=>{ P.delete(e.pointerId); if(P.size<2) pd0=0; };
  stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',up);
  stage.addEventListener('wheel',e=>{ e.preventDefault(); idleT=0; dist=Math.max(fitD*0.35,Math.min(fitD*1.8,dist*(1+Math.sign(e.deltaY)*0.1))); dirty=true; loop(); },{passive:false});
  let lastTap=0; stage.addEventListener('pointerup',e=>{ const t=performance.now(); if(t-lastTap<300){ reset(); } lastTap=t; });
  function reset(){ yaw=-1.4; pitch=0.14; dist=fitD; idleT=0; dirty=true; loop(); }
  const _b=new THREE.Box3(), _c=new THREE.Vector3(), _s=new THREE.Vector3();
  function shade(){ holder.updateMatrixWorld(true); _b.setFromObject(holder); if(_b.isEmpty()) return; _b.getCenter(_c); _b.getSize(_s); const Lm=Math.max(_s.x,_s.z,_s.y);
    ground.position.set(_c.x,_b.min.y-0.004,_c.z); ground.scale.set(Lm*2.2,Lm*2.2,1);
    sun.position.set(_c.x+Lm*0.08,_c.y+Lm*2,_c.z+Lm*0.12); sun.target.position.copy(_c); const sc=sun.shadow.camera; sc.left=-Lm*0.75; sc.right=Lm*0.75; sc.top=Lm*0.75; sc.bottom=-Lm*0.75; sc.near=0.01; sc.far=Lm*4; sc.updateProjectionMatrix(); sun.target.updateMatrixWorld();
    const im=holder.matrixWorld.clone().invert(); inv.forEach(u=>u.value.copy(im)); R.shadowMap.needsUpdate=true; dirty=true; loop(); }
  function fit(obj){ holder.position.set(0,0,0); holder.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(obj); const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); holder.position.set(-c.x,-c.y,-c.z);
     const tv=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)); const len=Math.max(s.x,s.y,s.z); fitD=Math.max(len*0.6/(tv*cam.aspect), s.y*0.8/tv)+len*0.08; dist=fitD; cam.near=fitD/50; cam.far=fitD*20; cam.updateProjectionMatrix(); shade(); }
  function recenter(){ holder.position.set(0,0,0); holder.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(holder); const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); holder.position.set(-c.x,-c.y,-c.z);
     const ratio=dist/fitD, tv=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)), len=Math.max(s.x,s.y,s.z); fitD=Math.max(len*0.6/(tv*cam.aspect), s.y*0.8/tv)+len*0.08; dist=fitD*ratio; cam.near=fitD/50; cam.far=fitD*20; cam.updateProjectionMatrix(); shade(); }
  function dispose(o){ o.traverse(q=>{ if(q.geometry) q.geometry.dispose(); }); }
  return { scene, holder, fit, recenter, reset, track(u){ inv.push(u); }, redraw(){ dirty=true; loop(); }, setAuto(v){ auto=v; idleT=v?4:0; loop(); },
    destroy(){ alive=false; if(raf) cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); dispose(scene); envRT.dispose(); pm.dispose(); R.dispose(); try{R.forceContextLoss();}catch(e){} } };
}

function hub(app,ctx){
  const own=Object.values(ACC).filter(a=>a.own).length, total=Object.keys(ACC).length;
  const h=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[L('Armero 3D','3D Gunsmith')]])+
  '<h1>'+L('Armero 3D','3D Gunsmith')+'</h1><p class="sub">'+L('Gira el arma en 3D, monta accesorios reales que existen para ella (miras, magnificador, silenciador, culata, empuñadura, láser, linterna, bípode) y prueba camuflajes. Los datos cambian solo con cifras publicadas por el fabricante; si no hay dato, no se inventa.','Spin the weapon in 3D, mount real accessories that exist for it (optics, magnifier, suppressor, stock, grip, laser, light, bipod) and try camouflages. Figures only change with numbers published by the maker; no data, no number.')+'</p>'+
  '<div class="arm-hub">'+W.map(w=>'<a class="arm-card" href="#/armero/'+w.id+'"><img src="'+DIR+(w.img||w.id)+'.jpg?v='+VER+'" alt="'+esc(w.n)+'" loading="lazy" width="800" height="320"><div class="t">'+esc(w.n)+'</div><div class="d">'+esc(LL(w.kind))+' · '+allAcc(w).length+' '+L('accesorios','accessories')+'</div></a>').join('')+'</div>'+
  '<p class="arm-note">'+L(W.length+' armas y '+total+' accesorios ('+own+' modelados por M.A.T). Seguiremos añadiendo armas y accesorios por tandas.',W.length+' weapons and '+total+' accessories ('+own+' modelled by M.A.T). More weapons and accessories will be added in batches.')+'</p>'+
  '<p class="arm-note">'+L('Modelos 3D de las armas: serie «Low-Poly» de GoldbergR en Sketchfab, licencia CC BY 4.0. Los accesorios marcados «MAT» son modelos aproximados hechos por M.A.T a partir de las medidas oficiales de cada fabricante (fuente en cada uno). Nada sacado de videojuegos ni generado con IA.','Weapon 3D models: GoldbergR\'s "Low-Poly" series on Sketchfab, CC BY 4.0 licence. Accessories marked "MAT" are approximate models built by M.A.T from each maker\'s official dimensions (source on each). Nothing taken from video games or generated with AI.')+'</p>';
  ctx.set(h,L('Armero 3D','3D Gunsmith'));
}

function page(app,ctx,w){
  const st={v:0,on:{},camo:'orig',ca:false};
  const sv=new URLSearchParams((location.hash.split('?')[1]||''));
  const shell=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[L('Armero 3D','3D Gunsmith'),'#/armero'],[w.n]])+
   '<h1>'+esc(w.n)+'</h1><p class="sub">'+esc(LL(w.kind))+' · <a href="#/a/'+w.ficha+'">'+L('Ver ficha completa','Full data sheet')+'</a></p>'+
   '<div class="arm-wrap"><div><div class="arm-stage" id="armst"><div class="arm-load">'+L('Cargando modelo 3D…','Loading 3D model…')+'</div><div class="arm-btns"><button type="button" id="armrot">'+L('Pausar giro','Pause spin')+'</button><button type="button" id="armrs">'+L('Centrar','Reset')+'</button></div><div class="arm-hint">'+L('Arrastra para girar · pellizca o rueda para zoom','Drag to rotate · pinch or scroll to zoom')+'</div></div>'+
   '<div id="armsum" class="arm-sum"></div><div id="armui"></div></div><div><div class="arm-stats" id="armstats"></div><div id="armacc"></div></div></div>'+
   '<div id="armcred"></div>';
  ctx.set(shell,w.n+' · '+L('Armero 3D','3D Gunsmith'));
  const stage=document.getElementById('armst'); stop();
  const V=viewer(stage);
  if(!V){ stage.querySelector('.arm-load').textContent=L('Tu navegador no puede mostrar 3D (WebGL).','Your browser cannot show 3D (WebGL).'); }
  ACTIVE=V;
  const UW=mkU(), UA=mkU(); if(V){ V.track(UW.uInv); V.track(UA.uInv); }
  const MCW=new Map(), MCA=new Map();
  let weapon=null; const mounted={}; let token=0;
  const ui=document.getElementById('armui');
  function cur(){ return w.V[st.v]; }
  const isDot=a=>a&&ACC[a]&&ACC[a].dot;
  function chip(sk,a){ const x=ACC[a]; const dis=sk==='mag'&&!isDot(st.on.optic);
    return '<button type="button" class="arm-chip'+(st.on[sk]===a?' on':'')+(dis?' dis':'')+'" data-s="'+sk+'" data-a="'+a+'"'+(dis?' disabled':'')+'>'+esc(x.n)+(x.own?' <i class="arm-own">MAT</i>':'')+'<small>'+esc(LL(x.k))+(x.g?' · '+fmtG(x.g):'')+'</small></button>'; }
  function renderUI(){
    const v=cur(); let h='';
    if(w.V.length>1) h+='<div class="arm-slot"><div class="sl">'+L('Calibre (versiones oficiales)','Calibre (official versions)')+'</div><div class="arm-chips">'+w.V.map((x,i)=>'<button type="button" class="arm-chip'+(i===st.v?' on':'')+'" data-v="'+i+'">'+esc(LL(x.lab))+'</button>').join('')+'</div></div>';
    SLOTS.forEach(([sk,nm])=>{ const opts=accs(v,sk); if(!opts.length) return;
      h+='<div class="arm-slot"><div class="sl">'+LL(nm)+(sk==='mag'?' <span class="arm-src">· '+L('va detrás de un punto rojo u holográfico','goes behind a red-dot or holographic sight')+'</span>':'')+'</div><div class="arm-chips"><button type="button" class="arm-chip'+(!st.on[sk]?' on':'')+'" data-s="'+sk+'" data-a="">'+(sk==='stock'?L('De serie','Standard'):L('Ninguno','None'))+'</button>'+
      opts.map(a=>chip(sk,a)).join('')+'</div></div>'; });
    h+='<div class="arm-slot"><div class="sl">'+L('Camuflaje','Camouflage')+'</div><div class="arm-chips">'+CAMO.map(c=>'<button type="button" class="arm-chip arm-cm'+(st.camo===c[0]?' on':'')+'" data-c="'+c[0]+'"><span class="arm-sw" style="background:'+sw(c[2])+'"></span>'+esc(LL(c[1]))+'</button>').join('')+'</div>'+
       '<label class="arm-tg"><input type="checkbox" id="armca"'+(st.ca?' checked':'')+'> '+L('Aplicar también a los accesorios','Apply to the accessories too')+'</label>'+
       '<p class="arm-note" style="margin:6px 0 0">'+L('Patrones genéricos generados por M.A.T (no son diseños registrados); se aplican a las piezas de polímero y anodizadas, no al acero ni a las lentes.','Generic patterns generated by M.A.T (not trademarked designs); applied to polymer and anodised parts, not to steel or lenses.')+'</p></div>';
    if(w.vnote) h+='<p class="arm-note">'+esc(LL(w.vnote))+'</p>';
    ui.innerHTML=h;
  }
  ui.addEventListener('change',e=>{ if(e.target.id==='armca'){ st.ca=e.target.checked; camo(); } });
  ui.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.disabled) return;
    if(b.dataset.v!=null){ const i=+b.dataset.v; if(i!==st.v){ st.v=i; Object.keys(st.on).forEach(s=>{ if(!accs(cur(),s).includes(st.on[s])) delete st.on[s]; }); load(); } }
    else if(b.dataset.c){ st.camo=b.dataset.c; camo(); }
    else if(b.dataset.s){ const s=b.dataset.s, a=b.dataset.a; if(a) st.on[s]=a; else delete st.on[s]; if(s==='optic'&&!isDot(st.on.optic)) delete st.on.mag; sync(); }
    renderUI(); stats(); });
  function camo(){ setU(UW,st.camo); setU(UA,st.ca?st.camo:'orig'); V&&V.redraw(); }
  function stats(){
    const v=cur(), S=v.st, on=SLOTS.map(([s])=>st.on[s]).filter(Boolean).map(a=>ACC[a]);
    const wOn=on.filter(a=>a.slot!=='stock'), add=wOn.reduce((s,a)=>s+(a.g||0),0), sup=on.find(a=>a.slot==='muzzle'), stk=on.find(a=>a.slot==='stock');
    const row=(k,val,extra)=>val?'<div class="arm-row"><div class="k">'+k+'</div><div>'+esc(LL(val))+(extra||'')+'</div></div>':'';
    let h=row(L('Calibre','Calibre'),S.cal);
    h+=row(L('Peso del arma','Weapon weight'),S.peso);
    if(wOn.length){ h+='<div class="arm-row"><div class="k">'+L('Accesorios','Accessories')+'</div><div><span class="arm-d" style="margin-left:0">+'+fmtG(add)+'</span> <span class="arm-src">('+wOn.length+')</span></div></div>';
      if(v.w) h+='<div class="arm-row"><div class="k">'+L('Total','Total')+'</div><div><b>≈ '+fmtKg(v.w+add/1000)+'</b> <span class="arm-src">('+fmtKg(v.w)+(v.wn?' '+LL(v.wn):'')+' + '+fmtG(add)+'; '+L('suma de pesos publicados','sum of published weights')+')</span></div></div>'; }
    if(stk) h+='<div class="arm-row"><div class="k">'+L('Culata','Stock')+'</div><div>'+esc(stk.n)+(stk.g?' · '+fmtG(stk.g):'')+' <span class="arm-src">('+L('sustituye a la de serie; no se suma al total porque no hay peso publicado de la culata original','replaces the standard one; not added to the total because the original stock\'s weight is not published')+')</span></div></div>';
    h+=row(L('Longitud','Length'),S.lon, sup&&sup.add?'<span class="arm-d">+ '+fmtMm(sup.add)+' '+L('con silenciador','with suppressor')+'</span>':sup&&sup.mm?'<span class="arm-d">+ '+L('silenciador','suppressor')+' '+fmtMm(sup.mm)+'</span>':'');
    h+=row(L('Cañón','Barrel'),S.can)+row(L('Cadencia','Rate of fire'),S.cad)+row(L('Velocidad de boca','Muzzle velocity'),S.vb)+row(L('Alcance eficaz','Effective range'),S.alc)+row(L('Alimentación','Feed'),S.ali);
    h+='<div class="arm-row"><div class="k">'+L('Fuente','Source')+'</div><div class="arm-src">'+L('Ficha M.A.T (Wikipedia)','M.A.T data sheet (Wikipedia)')+' · <a href="#/a/'+w.ficha+'">'+L('ver ficha','open')+'</a></div></div>';
    document.getElementById('armstats').innerHTML=h;
    document.getElementById('armsum').innerHTML=on.length?(v.w&&wOn.length?L('Peso total','Total weight')+' <b>≈ '+fmtKg(v.w+add/1000)+'</b> · ':wOn.length?L('Accesorios','Accessories')+' <b>+'+fmtG(add)+'</b> · ':'')+on.length+' '+L(on.length>1?'accesorios montados':'accesorio montado',on.length>1?'accessories mounted':'accessory mounted'):L('Sin accesorios: elige abajo qué montar','No accessories: pick below what to mount');
    let a='';
    if(on.length){ a='<ul class="arm-acc">'+on.map(x=>'<li><b>'+esc(x.n)+'</b>'+(x.own?' <i class="arm-own">MAT</i>':'')+' — '+esc(LL(x.k))+'<br>'+[x.g?L('Peso','Weight')+' '+fmtG(x.g)+(x.gn?' ('+LL(x.gn)+')':''):'',dims(Object.keys(ACC).find(k=>ACC[k]===x))].filter(Boolean).join(' · ')+(x.cal?'<div class="arm-src">'+L('Calibre','Calibre')+': '+esc(LL(x.cal))+'</div>':'')+(x.note?'<div class="arm-src">'+esc(LL(x.note))+'</div>':'')+(x.own?'<div class="arm-src"><b>'+LL(OWNTXT)+'.</b> '+L('Forma de detalle aproximada; medidas principales según el fabricante.','Detail shape is approximate; main dimensions per the maker.')+'</div>':'')+'<div class="arm-src">'+L('Fuente','Source')+': '+x.src.map(s=>'<a href="'+s[1]+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>').join(' · ')+'</div></li>').join('')+'</ul>'; }
    else a='<p class="arm-note">'+L('Elige accesorios y se montan en el arma.','Pick accessories and they are mounted on the weapon.')+'</p>';
    a+='<p class="arm-note">'+L('El peso total es la suma del peso del arma de su ficha y los pesos publicados por cada fabricante. No hay estadísticas de juego: solo datos reales.','Total weight is the weapon\'s weight from its data sheet plus each maker\'s published weight. No game stats: real data only.')+'</p>';
    document.getElementById('armacc').innerHTML=a;
    credits();
  }
  function credits(){
    const used=allAcc(w), gb=used.filter(a=>!ACC[a].own), ow=used.filter(a=>ACC[a].own);
    document.getElementById('armcred').innerHTML='<h2>'+L('Créditos de los modelos 3D','3D model credits')+'</h2><p class="arm-src">'+
      w.V.map(x=>'«<a href="'+x.m+'" target="_blank" rel="noopener">'+esc(x.mn)+'</a>»').join(', ')+(gb.length?' '+L('y accesorios','and accessories')+' '+gb.map(a=>'«<a href="'+ACC[a].m+'" target="_blank" rel="noopener">'+esc(ACC[a].mn)+'</a>»').join(', '):'')+
      ' — '+L('de','by')+' '+(w.au?'<a href="'+w.au[1]+'" target="_blank" rel="noopener">'+esc(w.au[0])+'</a>':'<a href="'+SF+'" target="_blank" rel="noopener">GoldbergR</a>')+(w.au&&gb.length?' '+L('y','and')+' <a href="'+SF+'" target="_blank" rel="noopener">GoldbergR</a>':'')+' (Sketchfab), '+L('licencia','licence')+' <a href="'+(w.lic?w.lic[1]:CCBY)+'" target="_blank" rel="noopener">'+(w.lic?w.lic[0]:'CC BY 4.0')+'</a>. '+
      L('Cambios de M.A.T: compresión (meshopt), origen recolocado, materiales PBR, camuflajes y posición de cada accesorio en el arma.','Changes by M.A.T: compression (meshopt), origin moved, PBR materials, camouflages and each accessory\'s position on the weapon.')+
      (ow.length?' '+L('Accesorios hechos por M.A.T a partir de medidas oficiales','Accessories built by M.A.T from official dimensions')+': '+ow.map(a=>esc(ACC[a].n)).join(', ')+'.':'')+
      ' '+L('Iluminación: HDRI «Studio Small 09» de Poly Haven (CC0).','Lighting: "Studio Small 09" HDRI from Poly Haven (CC0).')+' <a href="#/license">'+L('Licencias','Licences')+'</a></p>';
  }
  function setVis(){ if(!weapon) return; const v=cur(), m=mt(v); const hasOptic=!!st.on.optic;
    (w.hideOptic||[]).forEach(n=>weapon.traverse(o=>{ if(o.name&&o.name.includes(n)) o.visible=!hasOptic; }));
    if(m.stockNode) weapon.traverse(o=>{ if(o.name&&o.name.includes(m.stockNode)) o.visible=!st.on.stock; }); }
  function where(v,s,a){ const pl=v.pl&&v.pl[a]; if(pl) return Array.isArray(pl)?{p:pl}:pl; const m=mt(v), x=ACC[a];
    if(s==='optic'&&m.top!=null) return {p:[0,m.top,(st.on.mag&&m.oz2!=null)?m.oz2:m.oz]};
    if(s==='mag'&&m.top!=null&&st.on.optic){ const o=ACC[st.on.optic]; return {p:[0,m.top,(m.oz2!=null?m.oz2:m.oz)-((o.mm||100)/2+(x.mm||100)/2+6)*0.00118]}; }
    if(s==='muzzle'&&m.muz!=null) return {p:[0,m.bore,(x.add&&m.me!=null)?m.me-(x.mm-x.add)*0.00118:m.muz]};
    if(s==='under'&&m.uy!=null) return {p:[0,m.uy,m.uz]};
    if(s==='laser'&&m.lz!=null) return {p:[0,m.top,m.lz]};
    if(s==='light'&&m.sx!=null) return {p:[m.sx,m.sy,m.sz]};
    if(s==='bipod'&&m.uy!=null) return {p:[0,m.uy,m.bz]};
    if(s==='stock'&&m.stz!=null) return {p:[0,m.sty,m.stz]};
    return null; }
  async function make(a,s){ const x=ACC[a];
    if(x.own){ const K=await kit(); let d=x.d; if(s==='mag'&&st.on.optic) d=Object.assign({},d,{ay:ACC[st.on.optic].ay||d.ay}); return K.build(x.b,d,x.fde); }
    const g=await getGLB(x.f); return g.scene.clone(true); }
  async function sync(){
    if(!V||!weapon) return; const my=token; const v=cur();
    const keyOf=s=>st.on[s]?st.on[s]+(s==='mag'?'@'+(st.on.optic||''):'')+(s==='optic'&&st.on.mag?'+m':''):null;
    for(const s of Object.keys(mounted)){ if(keyOf(s)!==mounted[s].k){ V.holder.remove(mounted[s].o); delete mounted[s]; } }
    for(const [s,a] of Object.entries(st.on)){ if(mounted[s]) continue; const P=where(v,s,a); if(!P) continue; const k=keyOf(s);
      try{ const o=await make(a,s); if(my!==token||keyOf(s)!==k||mounted[s]) continue;
        o.position.set(...P.p); if(P.r) o.rotation.set(...P.r);
        if(P.sub){ o.updateMatrixWorld(true); for(const [nm,d] of Object.entries(P.sub)){ let hit=null; o.traverse(q=>{ if(!hit&&q.name&&q.name.includes(nm)) hit=q; }); if(hit){ const wp=hit.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(...d)); hit.parent.worldToLocal(wp); hit.position.copy(wp); } } }
        prep(o,UA,MCA); V.holder.add(o); mounted[s]={a,k,o}; }catch(e){ console.warn('armero acc',a,e); } }
    setVis(); V.recenter();
  }
  async function load(){
    if(!V) return; const my=++token; const v=cur();
    stage.querySelector('.arm-load')&&(stage.querySelector('.arm-load').style.display='flex');
    try{ const g=await getGLB(v.file); if(my!==token) return;
      if(weapon){ V.holder.remove(weapon); } Object.keys(mounted).forEach(s=>{ V.holder.remove(mounted[s].o); delete mounted[s]; });
      weapon=g.scene.clone(true); prep(weapon,UW,MCW); V.holder.add(weapon); V.fit(weapon);
      const ld=stage.querySelector('.arm-load'); if(ld) ld.style.display='none';
      await sync();
    }catch(e){ const ld=stage.querySelector('.arm-load'); if(ld) ld.textContent=L('No se pudo cargar el modelo. Comprueba la conexión.','The model could not be loaded. Check your connection.'); }
  }
  let spin=true; document.getElementById('armrot').onclick=e=>{ spin=!spin; V&&V.setAuto(spin); e.target.textContent=spin?L('Pausar giro','Pause spin'):L('Girar','Spin'); };
  document.getElementById('armrs').onclick=()=>V&&V.reset();
  // preselección por URL: #/armero/m4a1?acc=eotech,velos&camo=selva&ca=1
  const pre=(sv.get('acc')||'').split(',').filter(a=>ACC[a]); const vi=w.V.findIndex(x=>x.id===sv.get('v')); if(vi>=0) st.v=vi;
  pre.forEach(a=>{ if(accs(cur(),ACC[a].slot).includes(a)) st.on[ACC[a].slot]=a; }); if(!isDot(st.on.optic)) delete st.on.mag;
  if(CAMO.some(c=>c[0]===sv.get('camo'))) st.camo=sv.get('camo'); st.ca=sv.get('ca')==='1';
  renderUI(); stats(); camo(); load();
  window.MAT_ARMERO_DBG={st,mounted:()=>Object.keys(mounted)};
}

export function route(app,ctx,p){
  stop();
  if(!document.getElementById('armcss')){ const s=document.createElement('style'); s.id='armcss'; s.textContent=CSS; document.head.appendChild(s); }
  const id=(p[1]||'').split('?')[0];
  const w=id&&W.find(x=>x.id===id||x.V.some(v=>v.id===id));
  if(id&&!w) return ctx.notfound?ctx.notfound():hub(app,ctx);
  if(w) return page(app,ctx,w);
  return hub(app,ctx);
}
