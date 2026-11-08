/* M.A.T — «Negociador» (#/negociador): juego de negociación de crisis con rehenes.
   Cada partida se genera al azar (situación × perfil × motivo × rasgos ocultos) y no se repite.
   Las técnicas y su explicación siguen doctrina publicada (FBI LEB, Vecchi et al. 2005, McMains y Mullins,
   Voss y Raz, Grubb 2010, Giebels y Taylor 2009, Policía Nacional…), citada en el panel «Fuentes».
   Las reacciones del sujeto y los medidores son una simulación de M.A.T (se marcan «Estimación»).
   Los casos reales del informe final son casos documentados con su fuente; no hay casos inventados. */
const EN=()=>window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const T=v=>Array.isArray(v)?(EN()?v[1]:v[0]):(v==null?'':v);
let APP=null, X=null, P=null, G=null, RND=Math.random;
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const pick=a=>a[Math.floor(RND()*a.length)];
const ri=(a,b)=>a+Math.floor(RND()*(b-a+1));
const shuf=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(RND()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* sujeto mujer: en inglés he/him/his pasan a she/her (los pronombres de otras personas van como {marcas} y se ponen después) */
const FEM_EN=s=>s.replace(/\bhimself\b/g,'herself').replace(/\bHimself\b/g,'Herself').replace(/\bhim\b/g,'her').replace(/\bHim\b/g,'Her').replace(/\bhis\b/g,'her').replace(/\bHis\b/g,'Her').replace(/\bhe\b/g,'she').replace(/\bHe\b/g,'She');
function fill(s){ let x=String(T(s)); if(P&&P.fem&&EN()) x=FEM_EN(x); return x.replace(/\{(\w+)\}/g,(m,k)=>{ const v=P&&P.v?P.v[k]:null; return v==null?m:T(v); }); }

/* ---------------- fuentes ---------------- */
const SRC={
 nw:["Noesner y Webster, FBI Law Enforcement Bulletin (1997)","Noesner & Webster, FBI Law Enforcement Bulletin (1997)"],
 no24:["Noesner, FBI Law Enforcement Bulletin (2024)","Noesner, FBI Law Enforcement Bulletin (2024)"],
 vec:["Vecchi, Van Hasselt y Romano (2005)","Vecchi, Van Hasselt & Romano (2005)"],
 mm:["McMains y Mullins, Crisis Negotiations","McMains & Mullins, Crisis Negotiations"],
 voss:["Voss y Raz, Never Split the Difference (2016)","Voss & Raz, Never Split the Difference (2016)"],
 pn:["Policía Nacional (El País, 2025)","Spanish National Police (El País, 2025)"],
 gt:["Giebels y Taylor (2009)","Giebels & Taylor (2009)"],
 gl:["Caso Gladbeck (1988)","Gladbeck case (1988)"],
 sim:["Simulación M.A.T (Estimación)","M.A.T simulation (Estimate)"]
};
const FUENTES=[
 ["Doctrina del FBI y la NYPD (EE. UU.)","FBI and NYPD doctrine (US)",[
  ["G. W. Noesner y M. Webster, «Crisis Intervention: Using Active Listening Skills in Negotiations», FBI Law Enforcement Bulletin, agosto de 1997: etiquetado emocional, parafraseo, espejo, preguntas abiertas (sin «¿por qué?») y pausas.","G. W. Noesner & M. Webster, “Crisis Intervention: Using Active Listening Skills in Negotiations”, FBI Law Enforcement Bulletin, August 1997: emotion labelling, paraphrasing, mirroring, open questions (no “why”) and pauses.",""],
  ["G. Noesner, «Fifty Years of FBI Crisis (Hostage) Negotiation», FBI Law Enforcement Bulletin, 6 de agosto de 2024: la NYPD fundó la negociación de rehenes hacia 1973 (Schlossberg y Bolz); en 1990 el FBI adoptó la escucha activa de Carl Rogers; modelo de la escalera (Behavioral Change Stairway).","G. Noesner, “Fifty Years of FBI Crisis (Hostage) Negotiation”, FBI Law Enforcement Bulletin, 6 August 2024: the NYPD founded hostage negotiation around 1973 (Schlossberg and Bolz); in 1990 the FBI adopted Carl Rogers’ active listening; the Behavioral Change Stairway Model.","https://leb.fbi.gov/articles/featured-articles/fifty-years-of-fbi-crisis-hostage-negotiation"],
  ["J. Thompson, «“Crisis” or “Hostage” Negotiation? The Distinction Between Two Important Terms», FBI Law Enforcement Bulletin.","J. Thompson, “‘Crisis’ or ‘Hostage’ Negotiation? The Distinction Between Two Important Terms”, FBI Law Enforcement Bulletin.","https://leb.fbi.gov/articles/featured-articles/crisis-or-hostage-negotiation-the-distinction-between-two-important-terms"],
  ["G. M. Vecchi, V. B. Van Hasselt y S. J. Romano (2005), «Crisis (hostage) negotiation: current strategies and issues in high-risk conflict resolution», Aggression and Violent Behavior 10(5), 533–551: las cinco fases de la escalera (escucha activa, empatía, rapport, influencia, cambio de conducta), incentivos mínimos, mensajes en primera persona.","G. M. Vecchi, V. B. Van Hasselt & S. J. Romano (2005), “Crisis (hostage) negotiation: current strategies and issues in high-risk conflict resolution”, Aggression and Violent Behavior 10(5), 533–551: the five steps of the stairway (active listening, empathy, rapport, influence, behavioural change), minimal encouragers, I-messages.","https://www.sciencedirect.com/science/article/pii/S1359178904000758"],
  ["M. McMains, W. Mullins y A. Young, «Crisis Negotiations: Managing Critical Incidents and Hostage Situations in Law Enforcement and Corrections», Routledge: no decir «cálmate» ni «relájate», no mentir, cumplir las promesas, no decir «no» en seco, evitar palabras cargadas, no juzgar, hablar siempre directamente con el captor, plan de salida, preguntar directamente por el suicidio.","M. McMains, W. Mullins & A. Young, “Crisis Negotiations: Managing Critical Incidents and Hostage Situations in Law Enforcement and Corrections”, Routledge: don’t say “calm down” or “relax”, don’t lie, keep promises, don’t say a flat “no”, avoid loaded words, don’t judge, always talk to the hostage-taker directly, surrender plan, ask directly about suicide.","https://www.routledge.com/Crisis-Negotiations-Managing-Critical-Incidents-and-Hostage-Situations-in-Law-Enforcement-and-Corrections/McMains-Mullins-Young/p/book/9781138585522"],
  ["C. Voss y T. Raz (2016), «Never Split the Difference» (en español, «Rompe la barrera del no»), HarperBusiness: empatía táctica, espejo, etiquetas, auditoría de acusaciones, preguntas calibradas («¿cómo…?», «¿qué…?») y el «eso es».","C. Voss & T. Raz (2016), “Never Split the Difference”, HarperBusiness: tactical empathy, mirroring, labels, the accusation audit, calibrated questions (“how…?”, “what…?”) and “that’s right”.",""]]],
 ["Reino Unido, Alemania, Países Bajos y Australia","UK, Germany, the Netherlands and Australia",[
  ["A. Grubb (2010), «Modern day hostage (crisis) negotiation: The evolution of an art form within the policing arena», Aggression and Violent Behavior 15(5), 341–348 (Reino Unido).","A. Grubb (2010), “Modern day hostage (crisis) negotiation: The evolution of an art form within the policing arena”, Aggression and Violent Behavior 15(5), 341–348 (UK).","https://www.sciencedirect.com/science/article/abs/pii/S135917891000039X"],
  ["E. Giebels y P. J. Taylor (2009), «Interaction patterns in crisis negotiations: Persuasive arguments and cultural differences», Journal of Applied Psychology, vol. 94: negociaciones reales de la policía neerlandesa; la cultura del captor cambia cómo responde a los argumentos.","E. Giebels & P. J. Taylor (2009), “Interaction patterns in crisis negotiations: Persuasive arguments and cultural differences”, Journal of Applied Psychology, vol. 94: real Dutch police negotiations; the hostage-taker’s culture changes how they respond to arguments.","https://pubmed.ncbi.nlm.nih.gov/19186892/"],
  ["Polizei Rheinland-Pfalz (LKA), «Verhandlungsgruppe rettet seit 40 Jahren Leben», 5-12-2025: el grupo de negociación de Renania-Palatinado existe desde 1985 para tomas de rehenes, secuestros, amenazas graves y crisis suicidas; «la negociación es siempre el medio más suave para salvar vidas».","Polizei Rheinland-Pfalz (LKA), “Verhandlungsgruppe rettet seit 40 Jahren Leben”, 5 Dec 2025: the Rhineland-Palatinate negotiation group has existed since 1985 for hostage-takings, kidnappings, serious threats and suicidal crises; “negotiation is always the mildest means of saving lives”.","https://www.polizei.rlp.de/service/presse/detail/verhandlungsgruppe-rettet-seit-40-jahren-leben"],
  ["M. Morgan y C. Harfield (2026), «“Talk Them and Walk Them”: An Exploration of Police Negotiator Training for De-Escalating Crisis Situations», International Journal for Crime, Justice and Social Democracy 15(2) (Australia).","M. Morgan & C. Harfield (2026), “‘Talk Them and Walk Them’: An Exploration of Police Negotiator Training for De-Escalating Crisis Situations”, International Journal for Crime, Justice and Social Democracy 15(2) (Australia).","https://doi.org/10.5204/ijcjsd.3960"],
  ["Asedio del Spaghetti House (Londres, 1975): la Policía Metropolitana esperó, mantuvo la calma y habló el tiempo necesario, con el consejo de un psiquiatra forense (Wikipedia).","Spaghetti House siege (London, 1975): the Metropolitan Police waited, kept things calm and talked for as long as needed, advised by a forensic psychiatrist (Wikipedia).","https://en.wikipedia.org/wiki/Spaghetti_House_siege"]]],
 ["España y Europa","Spain and Europe",[
  ["El País, «Las pruebas de fuego del negociador policial: fuera vértigo, creatividad hiperactiva y nervios de acero», 19-9-2025: la red de negociadores de la Policía Nacional (53 agentes; curso de especialización desde 2016 en el cuartel de los GEO, Guadalajara). Citas: «La negociación es crear confianza» (inspector César Martín); «No por mucho hablar lo estás haciendo mejor» (inspectora jefa Isabel Espejo).","El País, “Las pruebas de fuego del negociador policial…”, 19 Sep 2025: the Spanish National Police negotiator network (53 officers; specialist course since 2016 at the GEO base in Guadalajara). Quotes: “Negotiation is building trust” (Inspector César Martín); “Talking more doesn’t mean you’re doing better” (Chief Inspector Isabel Espejo).","https://elpais.com/espana/2025-09-19/las-pruebas-de-fuego-del-negociador-policial-fuera-vertigo-creatividad-hiperactiva-y-nervios-de-acero.html"],
  ["Grupo Especial de Operaciones (GEO) de la Policía Nacional: liberación de rehenes e intervenciones de alto riesgo (Wikipedia).","Grupo Especial de Operaciones (GEO), Spanish National Police: hostage rescue and high-risk operations (Wikipedia).","https://es.wikipedia.org/wiki/Grupo_Especial_de_Operaciones"],
  ["Unidades especiales de intervención de la UE y Red ATLAS: GEO y UEI (Guardia Civil) en España, GIGN y RAID en Francia, GSG 9 en Alemania (Wikipedia).","EU special intervention units and the ATLAS network: GEO and UEI (Guardia Civil) in Spain, GIGN and RAID in France, GSG 9 in Germany (Wikipedia).","https://es.wikipedia.org/wiki/Unidades_especiales_de_intervenci%C3%B3n_de_la_Uni%C3%B3n_Europea"]]],
 ["Casos reales del informe final (Wikipedia)","Real cases in the debrief (Wikipedia)",[
  ["Atraco de Norrmalmstorg (Estocolmo, 1973).","Norrmalmstorg robbery (Stockholm, 1973).","https://en.wikipedia.org/wiki/Norrmalmstorg_robbery"],
  ["Asedio del Spaghetti House (Londres, 1975).","Spaghetti House siege (London, 1975).","https://en.wikipedia.org/wiki/Spaghetti_House_siege"],
  ["Caso Tony Kiritsis (Indianápolis, 1977).","Tony Kiritsis case (Indianapolis, 1977).","https://en.wikipedia.org/wiki/Tony_Kiritsis"],
  ["Asalto al Banco Central de Barcelona (1981).","Banco Central raid, Barcelona (1981).","https://es.wikipedia.org/wiki/Asalto_al_Banco_Central_de_Barcelona"],
  ["Secuestro de Gladbeck (Alemania, 1988).","Gladbeck hostage crisis (Germany, 1988).","https://en.wikipedia.org/wiki/Gladbeck_hostage_crisis"]]],
 ["Lo que es simulación","What is simulated",[
  ["Los personajes, nombres, expedientes y diálogos son inventados y genéricos. Cómo reacciona el sujeto y los medidores de tensión y confianza son una Estimación de M.A.T basada en la doctrina citada: no predicen casos reales. Imagen de la tarjeta: negociadores de rehenes de la policía de Northamptonshire en un ejercicio en RAF Croughton (Inglaterra, 2023), Senior Airman Jason W. Cochran, Fuerza Aérea de EE. UU., dominio público.","Characters, names, dossiers and dialogue are invented and generic. How the subject reacts and the tension and trust meters are an M.A.T Estimate based on the doctrine cited: they don’t predict real cases. Card image: Northamptonshire Police hostage negotiators during an exercise at RAF Croughton (England, 2023), Senior Airman Jason W. Cochran, US Air Force, public domain.","https://commons.wikimedia.org/wiki/File:Pathfinders,_Northamptonshire_first_responders_conduct_joint_exercise_(8086506).jpg"]]]
];

/* ---------------- técnicas (informe final) ---------------- */
const TECH={
 pres:[["Presentarse y pregunta abierta","Introduce yourself + open question"],["Decir quién eres y preguntar algo que no se contesta con sí o no le invita a hablar. Mejor «¿qué está pasando?» que «¿por qué?», que suena a interrogatorio.","Saying who you are and asking something that can’t be answered yes or no invites them to talk. “What’s going on?” beats “why?”, which sounds like an interrogation."],"nw",1],
 etiq:[["Etiquetado emocional","Emotion labelling"],["Poner nombre a lo que siente («parece que estás hart{o} de…») le demuestra que le entiendes y baja la intensidad. Es de las herramientas más potentes de la escucha activa.","Naming what they feel (“it sounds like you’re fed up with…”) shows you understand and lowers the intensity. One of the most powerful active-listening tools."],"nw",1],
 espejo:[["Espejo","Mirroring"],["Repetir sus últimas palabras en tono de pregunta le anima a seguir hablando y te da información sin dirigirle.","Repeating their last words as a question keeps them talking and gives you information without steering."],"voss",1],
 parafr:[["Parafraseo","Paraphrasing"],["Repetir con tus palabras lo que te ha dicho demuestra que no solo escuchas: entiendes.","Restating what they said in your own words shows you’re not just hearing, you understand."],"nw",1],
 resumen:[["Resumen («eso es»)","Summary (“that’s right”)"],["Resumir sus motivos y emociones hasta que diga «eso es». Es la señal de que se siente entendido y de que puedes empezar a influir.","Summarising their reasons and emotions until they say “that’s right”. It signals they feel understood and that you can start to influence."],"voss",1],
 pausa:[["Pausa","Effective pause"],["Un silencio a tiempo deja espacio para que hable y que piense. «No por mucho hablar lo estás haciendo mejor» (inspectora jefa Isabel Espejo, Policía Nacional).","A well-timed silence gives them room to talk and think. “Talking more doesn’t mean you’re doing better” (Chief Inspector Isabel Espejo, Spanish National Police)."],"pn",1],
 mini:[["Incentivos mínimos","Minimal encouragers"],["«Ya», «sigue», «te escucho»: le dicen que estás ahí sin cortarle.","“Mm”, “go on”, “I’m listening”: they show you’re there without cutting in."],"vec",1],
 yo:[["Mensaje en primera persona","I-message"],["Hablar de lo que a ti te preocupa («me preocupa que…») en vez de acusarle.","Speaking about your own concern (“I’m worried that…”) instead of accusing them."],"vec",1],
 calib:[["Pregunta calibrada","Calibrated question"],["Preguntas con «¿cómo…?» o «¿qué…?» que le hacen pensar contigo en la solución sin que tengas que decir que no.","“How…?” or “what…?” questions that make them work out the solution with you without you having to say no."],"voss",1],
 tiempo:[["Ganar tiempo","Buying time"],["El tiempo juega a favor: baja la adrenalina, cansa y abre opciones. La negociación es lenta a propósito.","Time is on your side: adrenaline drops, fatigue sets in and options open up. Negotiation is slow on purpose."],"vec",1],
 autor:[["Autoridad superior","Deferral to higher authority"],["«No depende de mí, tengo que consultarlo» evita el «no» en seco, gana tiempo y no rompe la relación.","“It’s not my call, I have to check” avoids a flat no, buys time and keeps the relationship."],"mm",1],
 qpq:[["Intercambio","Quid pro quo"],["Algo a cambio de algo: agua o comida a cambio de que salga una persona. En el Banco Central (1981) hubo varios intercambios de rehenes por comida.","Something for something: water or food in exchange for someone walking out. At the Banco Central (1981) several hostages were exchanged for food."],"mm",1],
 gancho:[["Gancho personal","Personal hook"],["Apelar a lo que de verdad le importa (sus hijos, su madre, su perro, su oficio) en la fase de influencia. Solo funciona si esa relación es real y buena; si no, se convierte en un detonante.","Appealing to what really matters to them (children, mother, dog, trade) in the influence stage. It only works if that bond is real and good; if not, it becomes a trigger."],"vec",1],
 digna:[["Salida digna","Face-saving"],["Darle una forma de terminar sin humillarse, reflejando lo bueno que ha hecho («has cuidado de ella»).","Giving them a way out without humiliation, reflecting the good they’ve done (“you’ve looked after her”)."],"mm",1],
 honest:[["No mentir","Honesty"],["Si te pilla en una mentira, se rompe todo. La doctrina es clara: no mentir y cumplir lo que prometes.","If they catch you lying, everything breaks. The doctrine is clear: don’t lie and keep what you promise."],"mm",1],
 plan:[["Plan de salida","Surrender plan"],["Pasos claros y lentos: primero salen las personas retenidas, luego él, con las manos vacías y a la vista. Que sepa exactamente qué va a pasar.","Clear, slow steps: the people held come out first, then them, hands empty and visible. They know exactly what will happen."],"mm",1],
 asksui:[["Preguntar directamente por el riesgo","Asking directly about suicide"],["Ante señales de que quiere morir, la doctrina pide preguntarlo directamente y escuchar la respuesta. Preguntar no empeora el riesgo: lo saca a la luz.","When there are signs they want to die, doctrine says ask directly and listen. Asking doesn’t raise the risk: it brings it into the open."],"mm",1],
 noplazo:[["Dejar pasar el plazo","Letting the deadline pass"],["No aceptar ni discutir el plazo: seguir hablando. Que los plazos pasen sin consecuencias es una señal de desescalada.","Neither accepting nor arguing with the deadline: keep talking. Deadlines passing without consequences is a sign of de-escalation."],"mm",1],
 fuente:[["Familiar como fuente","Family as a source"],["Hablar con la familia para saber más del sujeto, pero sin pasarle el teléfono: el negociador debe hablar siempre directamente con el captor.","Talking to the family to learn more, but not handing them the phone: the negotiator should always talk to the hostage-taker directly."],"mm",1],
 foco:[["Volver a lo importante","Refocusing"],["Quitarle el foco a la cámara y devolverlo a la conversación. En Gladbeck (1988) las entrevistas en directo convirtieron el caso en un circo.","Taking the focus off the cameras and back to the conversation. In Gladbeck (1988) live interviews turned the case into a circus."],"gl",1],
 calma:[["«Cálmate»","“Calm down”"],["Ordenar calma no calma a nadie: suena a que no le tomas en serio. McMains y Mullins lo incluyen entre lo que no hay que decir.","Ordering calm calms no one: it sounds like you don’t take them seriously. McMains and Mullins list it among the things not to say."],"mm",0],
 amenaza:[["Amenaza o ultimátum","Threat or ultimatum"],["Presionar o amenazar sube la tensión y le quita salidas. El negociador debe ser no agresivo y no amenazante.","Pressure or threats raise tension and close off exits. The negotiator should be non-aggressive and non-threatening."],"mm",0],
 mentira:[["Mentira","Lying"],["Mentir puede servir un minuto, pero si te pillan se acabó la confianza. «No mientas al sujeto».","A lie can work for a minute, but once caught, trust is gone. “Do not lie to the actor.”"],"mm",0],
 promesa:[["Promesa imposible","Promise you can’t keep"],["Prometer lo que no puedes cumplir (un coche, que no le pasará nada) se vuelve en tu contra cuando no llega.","Promising what you can’t deliver (a car, that nothing will happen) backfires when it doesn’t come."],"mm",0],
 juicio:[["Juzgar o sermonear","Judging or lecturing"],["El negociador no tiene que estar de acuerdo, pero no debe juzgar: un sermón le pone a la defensiva.","The negotiator needn’t agree but mustn’t judge: a lecture puts them on the defensive."],"mm",0],
 minim:[["Quitar importancia","Minimising"],["«No es para tanto» invalida lo que siente: es lo contrario de la escucha activa.","“It’s not that bad” invalidates what they feel: the opposite of active listening."],"nw",0],
 nono:[["Decir «no» en seco","Flat “no”"],["Un «no» rotundo cierra la conversación. Mejor no decir ni sí ni no y buscar alternativas.","A flat no ends the conversation. Better to say neither yes nor no and look for alternatives."],"mm",0],
 tpi:[["Pasar el teléfono a un tercero","Handing the phone to a third party"],["Meter a un familiar o a otra persona en directo es imprevisible y puede empeorarlo todo. El negociador debe hablar siempre directamente con el captor.","Putting a relative or someone else on the line is unpredictable and can make things worse. The negotiator should always talk directly to the hostage-taker."],"mm",0],
 precoz:[["Resolver antes de tiempo","Problem-solving too early"],["Ofrecer soluciones antes de escucharle se salta la escalera: la influencia llega después del rapport, no antes.","Offering solutions before listening skips the stairway: influence comes after rapport, not before."],"vec",0],
 cargada:[["Palabra cargada","Loaded word"],["Palabras como «rendirse» o «rehenes» suenan a derrota o a mercancía. Hay que evitar las palabras cargadas.","Words like “surrender” or “hostages” sound like defeat or bargaining chips. Loaded words should be avoided."],"mm",0],
 prisa:[["Meter prisa","Rushing"],["Las prisas suben la tensión justo cuando estaba bajando. La negociación es lenta a propósito.","Rushing raises tension just as it was falling. Negotiation is slow on purpose."],"vec",0],
 medios:[["Darle protagonismo en los medios","Feeding the media spotlight"],["Alimentar la atención de las cámaras le da un escenario. En Gladbeck (1988) las entrevistas en directo empeoraron el caso.","Feeding the cameras gives them a stage. In Gladbeck (1988) live interviews made things worse."],"gl",0],
 evasiva:[["Evasiva","Dodging"],["Esquivar una pregunta directa suena a que escondes algo. No hace falta dar detalles, pero sí ser honesto.","Dodging a direct question sounds like hiding something. You needn’t give details, but you must be honest."],"mm",0]
};
const BASE={pres:[-6,9],etiq:[-7,10],espejo:[-4,7],parafr:[-5,8],resumen:[-7,11],pausa:[-4,6],mini:[-3,5],yo:[-5,8],calib:[-5,9],tiempo:[-4,6],autor:[-4,6],qpq:[-3,7],gancho:[-6,9],digna:[-7,10],honest:[-6,10],plan:[-8,10],asksui:[-5,10],noplazo:[-5,7],fuente:[-3,6],foco:[-5,7],
 calma:[12,-6],amenaza:[18,-11],mentira:[6,-8],promesa:[-2,3],juicio:[12,-8],minim:[10,-7],nono:[12,-7],tpi:[15,-9],precoz:[6,-4],cargada:[7,-4],prisa:[10,-6],medios:[9,-5],evasiva:[6,-5]};

/* ---------------- generador de perfiles ---------------- */
const NM=['Álvaro','Rubén','Iván','Sergio','Manuel','Antonio','Joaquín','Ramón','Daniel','Cristian','Raúl','Francisco','Julián','Esteban','Óscar','Hugo','Marcos','Andrés','Tomás','Ignacio','Gonzalo','Víctor','Emilio','Jaime','Rafael','Felipe','Alberto','Diego','Samuel','Eloy'];
const NF=['Lucía','Marta','Carmen','Rosa','Nerea','Pilar','Elena','Sonia','Irene','Teresa','Raquel','Inés','Begoña','Natalia','Mercedes'];
const AP=['García','Martín','López','Sánchez','Gómez','Ruiz','Navarro','Moreno','Iglesias','Herrero','Castillo','Ortega','Delgado','Cano','Prieto','Vidal','Méndez','Lorenzo','Cabrera','Pascual','Soler','Vega','Carrasco','Bravo','Rojas','Campos','Fuentes','Gil','Rubio','Benítez'];
const KIDS=['Alba','Hugo','Lola','Pablo','Noa','Leo','Vera','Mario','Sara','Izan','Carla','Bruno'];
const CITY=['Valladolid','Zaragoza','Murcia','Alicante','Córdoba','Vigo','Gijón','Badajoz','Burgos','León','Málaga','Granada','Albacete','Logroño','Salamanca','Cáceres','Huelva','Castellón','Santander','Pamplona','Tarragona','Ourense','Jaén','Lleida'];
const RURAL=['una casa de campo a las afueras de','una nave agrícola cerca de','una casa aislada en un pueblo de la provincia de'];
const DOG=['Toby','Lur','Coco','Rufo','Nala','Thor','Kira'];
const HOST_M=['Luis','Javier','Pedro','Enrique','Miguel','Arturo','Fernando','Germán'];
const HOST_F=['Ana','Rocío','Laura','Patricia','Gloria','Silvia','Montse','Julia','Amparo'];
const YO=['Laura','Miguel','Ana','Javier','Beatriz','Pablo','Elena','Carlos'];

function sig(p){ return [p.sit,p.band,p.motive,p.hook||'-',p.trigger||'-',p.savvy?1:0,p.despair,p.name].join('|'); }
function histGet(){ try{ const v=JSON.parse(localStorage.getItem('mat_neg_hist')||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
function histAdd(s){ try{ const h=histGet().filter(x=>x!==s); h.unshift(s); localStorage.setItem('mat_neg_hist',JSON.stringify(h.slice(0,60))); }catch(e){} }

function lst(a,en){ return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+(en?' and ':' y ')+a[a.length-1]; }
function makeProfile(seed){
 RND=rng(seed);
 const p={seed:seed, notes:[], keys:[]};
 p.sit=pick(['banco','tienda','agravio','fugado']);
 p.fem=RND()<0.2;
 p.name=pick(p.fem?NF:NM); p.ape=pick(AP)+' '+pick(AP);
 p.band=p.sit==='agravio'?pick(['adulto','maduro','mayor','mayor']):p.sit==='fugado'?pick(['joven','adulto','adulto','maduro']):pick(['joven','joven','adulto','maduro','mayor']);
 p.age={joven:ri(18,23),adulto:ri(26,41),maduro:ri(44,59),mayor:ri(63,76)}[p.band];
 p.city=pick(CITY);
 const o=p.fem?'a':'o';
 /* familia */
 p.kids=[]; p.estranged=false; p.hook=null; p.trigger=null; p.despair=0; p.savvy=false; p.substance=false; p.impulsive=0; p.inst=false; p.heard=false;
 let civil, vive;
 const mom={n:pick(['Carmen','Rosario','Maribel','Josefa','Encarna','Luisa']),age:0};
 if(p.band==='joven'){
   civil=["Soltero","Single"]; mom.age=p.age+ri(22,30);
   if(RND()<0.65){ vive=[`Con su madre, ${mom.n} (${mom.age}). Muy unid${o}s: «es lo único que tiene», dice una vecina.`,`With his mother, ${mom.n} (${mom.age}). Very close: “she’s all he has”, a neighbour says.`]; p.hook='madre'; p.keys.push('madre'); }
   else { vive=["Comparte piso con dos amigos. Su padre murió en 2022; con su madre «no se habla».","Shares a flat with two friends. His father died in 2022; he “doesn’t speak” to his mother."]; p.keys.push('sinmadre'); }
   if(p.age>=20&&RND()<0.2){ const k={n:pick(KIDS),age:ri(1,Math.min(2,p.age-19))}; p.kids.push(k); }
   p.impulsive=2;
 } else if(p.band==='adulto'){
   const r=RND();
   if(r<0.35){ civil=[p.fem?"Casada":"Casado",p.fem?"Married":"Married"]; vive=["Con su pareja y sus hijos.","With partner and children."]; }
   else if(r<0.75){ civil=[p.fem?"Separada":"Separado","Separated"]; vive=[`Sol${o} en un piso de alquiler desde la separación.`,"Alone in a rented flat since the separation."]; if(RND()<0.6){ p.trigger='expareja'; } }
   else { civil=[p.fem?"Soltera":"Soltero","Single"]; vive=[`Sol${o}.`,"Alone."]; }
   const nk=civil[1]==='Single'?(RND()<0.3?1:0):ri(1,3);
   for(let i=0;i<nk;i++) p.kids.push({n:pick(KIDS),age:ri(1,Math.min(14,p.age-19))});
   if(p.kids.length) p.hook='hijos';
   p.impulsive=1;
 } else if(p.band==='maduro'){
   const r=RND();
   civil=r<0.4?[p.fem?"Casada":"Casado","Married"]:r<0.8?[p.fem?"Divorciada":"Divorciado","Divorced"]:[p.fem?"Viuda":"Viudo","Widowed"];
   vive=civil[1]==='Married'?["Con su pareja.","With partner."]:[`Sol${o}.`,"Alone."];
   const nk=ri(0,3); for(let i=0;i<nk;i++) p.kids.push({n:pick(KIDS),age:ri(8,Math.max(9,p.age-22))});
   if(p.kids.length){ if(RND()<0.45){ p.estranged=true; } else p.hook='hijos'; }
   if(civil[1]==='Divorced'&&RND()<0.4) p.trigger='expareja';
 } else {
   const r=RND();
   civil=r<0.6?[p.fem?"Viuda":"Viudo","Widowed"]:r<0.85?[p.fem?"Divorciada":"Divorciado","Divorced"]:[p.fem?"Casada":"Casado","Married"];
   vive=civil[1]==='Married'?["Con su pareja, enferma de alzhéimer.","With partner, who has Alzheimer’s."]:[`Sol${o}.`,"Alone."];
   const nk=ri(1,3); for(let i=0;i<nk;i++) p.kids.push({n:pick(['Rosa','Manuel','Antonio','Pilar','José','Isabel','Juan','Mercedes']),age:ri(30,p.age-22)});
   if(RND()<0.55) p.estranged=true;
   if(!p.estranged&&RND()<0.6){ p.nieta={n:pick(['Alba','Lola','Noa','Vera','Sara','Carla','Lucía','Martina']),age:ri(4,9)}; p.hook='nieta'; }
   else if(RND()<0.55){ p.dog=pick(DOG); p.hook='perro'; }
   p.despair=civil[1]==='Widowed'?1:0;
 }
 if(p.sit!=='agravio'&&p.band!=='joven'&&!p.hook&&!p.dog&&RND()<0.35){ p.dog=pick(DOG); p.hook='perro'; }
 { const seen={}; p.kids=p.kids.filter(k=>seen[k.n]?0:(seen[k.n]=1)); p.kids.sort((a,b)=>b.age-a.age); }
 p.civil=civil; p.vive=vive; p.mom=mom;
 /* trabajo */
 const JOBS={joven:[["repartidor en moto","motorbike courier"],["camarero los fines de semana","weekend waiter"],["aprendiz en un taller","workshop apprentice"],["en paro desde que dejó el FP","unemployed since leaving vocational school"]],
  adulto:[["mozo de almacén","warehouse worker"],["albañil","bricklayer"],["conductor de autobús","bus driver"],["comercial de seguros","insurance salesperson"],["cocinero","cook"],["mecánico","mechanic"]],
  maduro:[["encargado de obra","site foreman"],["taxista","taxi driver"],["administrativo","office clerk"],["pescador","fisherman"],["dueño de un bar que cerró en 2025","owner of a bar that closed in 2025"]],
  mayor:[["carpintero jubilado","retired carpenter"],["profesor de instituto jubilado","retired secondary-school teacher"],["agricultor jubilado","retired farmer"],["camionero jubilado","retired lorry driver"],["electricista jubilado","retired electrician"]]};
 const SAV=[["vigilante de seguridad durante {y} años","security guard for {y} years"],["militar de tropa durante {y} años","enlisted soldier for {y} years"],["escolta privado durante {y} años","private bodyguard for {y} years"]];
 p.job=pick(JOBS[p.band]); p.jobs=[p.job];
 if(p.band!=='joven'&&RND()<0.38){ const y=ri(6,15); const s=pick(SAV); p.jobs.push([s[0].replace('{y}',y),s[1].replace('{y}',y)]); p.savvy=true; }
 if(p.band==='mayor'&&RND()<0.5&&!p.hook){ p.hook='oficio'; p.oficioYears=ri(28,42); }
 /* antecedentes y salud */
 p.record=["Sin antecedentes.","No criminal record."];
 if(p.sit==='fugado'){ const y=ri(2,6); p.record=[`Cumplía ${y} años por robo con violencia. No volvió de un permiso penitenciario hace 9 días.`,`Serving ${y} years for violent robbery. Failed to return from prison leave 9 days ago.`]; p.trigger=p.trigger||'carcel'; p.prison=true; }
 else if(RND()<0.35&&p.band!=='mayor'&&p.age>=21){ /* fechas posibles para su edad: prisión solo de adulto (18 años) */ const y0=Math.max(2026-p.age+18,2026-ri(4,9)); p.record=[`Cumplió 2 años de prisión por un robo (${y0}–${y0+2}).`,`Served 2 years in prison for a robbery (${y0}–${y0+2}).`]; p.prison=true; if(RND()<0.6) p.trigger=p.trigger||'carcel'; }
 else if(RND()<0.3){ /* hurtos: desde los 14 años (edad penal en España) */ const a0=Math.max(2026-p.age+14,2026-ri(6,9)), y1=ri(a0,2024), y2=ri(y1+1,2025); p.record=[`Dos hurtos menores (${y1} y ${y2}).`,`Two minor thefts (${y1} and ${y2}).`]; }
 p.health=["Sin datos.","No data."];
 const hr=RND();
 if(p.band==='mayor'&&hr<0.62){ p.health=["Diagnóstico de una enfermedad grave hace tres meses. Esta semana ha regalado sus herramientas a un vecino.","Diagnosed with a serious illness three months ago. This week he gave his tools away to a neighbour."]; p.despair+=2; p.keys.push('regalo'); }
 else if(hr<0.22){ p.health=["En tratamiento por depresión desde 2024.","Treated for depression since 2024."]; p.despair+=1; }
 else if(hr<0.4){ p.health=["Ingreso psiquiátrico voluntario en 2024. Según su hermana, le hiere mucho que le traten «como a un loco».","Voluntary psychiatric admission in 2024. His sister says it hurts him deeply to be treated “like a madman”."]; if(!p.trigger) p.trigger='loco'; }
 if(RND()<0.3&&p.band!=='mayor'){ p.substance=true; p.subst=pick([["Un testigo le vio beber en un bar justo antes.","A witness saw him drinking in a bar just before."],["Consumo de cocaína, según su entorno.","Cocaine use, according to people close to him."]]); }
 p.despair=Math.min(2,p.despair);
 /* situación y motivo */
 const yoN=pick(YO); p.yo=yoN;
 if(p.sit==='banco'){
   p.motive=pick(['deudas','golpe','adiccion']); p.place=[`una sucursal bancaria en ${p.city}`,`a bank branch in ${p.city}`];
   p.nh=ri(2,5);
 } else if(p.sit==='tienda'){
   p.motive=pick(['adiccion','deudas','paro']); const sh=pick([["una joyería","a jeweller’s"],["una gasolinera","a petrol station"],["un supermercado","a supermarket"],["una farmacia","a pharmacy"],["un estanco","a tobacconist’s"]]);
   p.place=[`${sh[0]} de ${p.city}`,`${sh[1]} in ${p.city}`]; p.nh=ri(1,2);
 } else if(p.sit==='agravio'){
   p.motive=pick(['desahucio','despido','seguro']); p.heard=true;
   const pl={desahucio:["la oficina del banco que ejecutó el desahucio de su casa","the office of the bank that repossessed his home"],despido:["las oficinas de la empresa que le despidió","the offices of the company that fired him"],seguro:["la aseguradora que rechazó pagarle el incendio de su taller","the insurer that refused to pay out for the fire at his workshop"]}[p.motive];
   p.place=[pl[0]+' en '+p.city, pl[1]+' in '+p.city]; p.nh=ri(1,2);
 } else {
   p.motive='huida'; p.place=RND()<0.5?[`un piso de ${p.city} en el que entró al huir de un control`,`a flat in ${p.city} he forced his way into fleeing a checkpoint`]:[`${pick(RURAL)} ${p.city}`,`an isolated house near ${p.city}`]; p.nh=ri(1,3); p.inst=RND()<0.5;
 }
 if(p.motive==='golpe'){ p.inst=true; }
 p.rural=/casa de campo|nave|aislada/.test(p.place[0]);
 p.corps=p.rural?["Guardia Civil","Guardia Civil"]:["Policía Nacional","National Police"];
 /* estado de ánimo */
 if(p.despair>=2) p.mood='apatia'; else if(p.inst&&RND()<0.7) p.mood='frio'; else if(p.band==='joven') p.mood=pick(['panico','panico','ira']); else if(p.heard) p.mood=pick(['ira','ira','triste']); else p.mood=pick(['panico','ira','triste','frio']);
 if(p.mood==='frio') p.inst=true;
 const MOOD={panico:["Muy nervios{o}: grita y se le quiebra la voz, según los testigos.","Very agitated: shouting, voice breaking, witnesses say."],ira:["Furios{o}: golpea cosas y exige hablar «con alguien que mande».","Furious: hitting things and demanding to speak “to someone in charge”."],triste:["Llora a ratos; luego se enfada consigo mism{o}.","Cries at times, then gets angry at himself."],frio:["Tranquil{o} y calculador{a}: habla poco y pregunta por los procedimientos.","Calm and calculating: speaks little and asks about procedures."],apatia:["Apátic{o}: repite que «ya le da igual todo».","Apathetic: keeps saying “nothing matters any more”."]};
 const fx=s=>s.replace(/\{o\}/g,o).replace(/\{a\}/g,p.fem?'a':'');
 p.moodTxt=[fx(MOOD[p.mood][0]),MOOD[p.mood][1]];
 p.tension0={panico:68,ira:72,triste:52,frio:46,apatia:38}[p.mood];
 /* motivo en texto */
 const MOT={deudas:["Debe unos 40.000 € a prestamistas que le amenazan.","Owes about €40,000 to loan sharks who threaten him."],golpe:["Atraco planeado: la alarma silenciosa saltó antes de lo previsto.","Planned robbery: the silent alarm went off sooner than expected."],adiccion:["Necesitaba dinero para consumir; lleva días sin dormir.","Needed money for drugs; hasn’t slept for days."],paro:["Dos años en paro; le van a echar del piso este mes.","Two years unemployed; being evicted this month."],desahucio:["Perdió su casa en un desahucio hace dos meses. Ha presentado cuatro reclamaciones sin respuesta.","Lost his home to repossession two months ago. Filed four complaints, none answered."],despido:["Despedido tras 19 años en la empresa con un correo electrónico. Dice que «nadie le ha escuchado».","Fired by email after 19 years at the company. Says “nobody has listened to him”."],seguro:["La aseguradora rechazó pagar el incendio de su taller; lo ha perdido todo. Reclama «justicia».","The insurer refused to pay for the fire at his workshop; he has lost everything. He demands “justice”."],huida:["Huye para no volver a prisión.","On the run to avoid going back to prison."]};
 p.motTxt=MOT[p.motive];
 if(p.motive==='paro'||p.motive==='deudas'){ if(p.despair<1&&RND()<0.4) p.despair=1; }
 /* rehenes */
 p.host=[]; const used={};
 const ROLE={banco:[["empleado","empleada","employee"],["cliente","clienta","customer"],["director de la sucursal","directora de la sucursal","branch manager"],["cajero","cajera","cashier"],["cliente","clienta","customer"]],
  tienda:[["dependiente","dependienta","shop assistant"],["cliente","clienta","customer"]],
  agravio:[{desahucio:["director de la oficina","directora de la oficina","branch manager"],despido:["director de personal","directora de personal","HR director"],seguro:["jefe de siniestros","jefa de siniestros","claims manager"]}[p.motive],["administrativo","administrativa","office worker"]],
  fugado:[["propietario del piso","propietaria del piso","home owner"],["vecino","vecina","neighbour"],["inquilino","inquilina","tenant"]]};
 for(let i=0;i<p.nh;i++){ const f=RND()<0.55; let n; do{ n=pick(f?HOST_F:HOST_M); }while(used[n]); used[n]=1;
   const rl=(ROLE[p.sit][i]||pick(ROLE[p.sit])); p.host.push({n:n,f:f,role:[f?rl[1]:rl[0],rl[2]],age:ri(24,68),out:false,cond:null}); }
 const hc=p.host[Math.floor(RND()*p.host.length)]; hc.cond=pick([["diabétic"+(hc.f?'a':'o'),"diabetic","insulina","insulin","es","is"],["asmátic"+(hc.f?'a':'o'),"asthmatic","inhalador","inhaler","es","is"],["problemas de corazón","a heart condition","medicación","medication","tiene","has"]]);
 /* notas de inteligencia y claves */
 const NOTE=(es,en,key,why)=>p.notes.push({t:[es,en],key:key,why:why});
 if(p.hook==='madre') NOTE(`Su madre, ${mom.n}, ha llegado al cordón policial y pide hablar con él.`,`His mother, ${mom.n}, has arrived at the cordon and is asking to speak to him.`,'madre',["Su madre es su ancla: puedes usarla como gancho, pero contigo hablando, no pasándole el teléfono.","His mother is his anchor: use her as a hook, but you do the talking, don’t hand her the phone."]);
 if(p.kids.length===1&&p.estranged) NOTE(`Su hermano dice que ${p.kids[0].n}, su único hijo, no le habla desde 2019.`.replace('su único hijo',/^(Rosa|Pilar|Isabel|Mercedes|Alba|Lola|Noa|Vera|Sara|Carla)$/.test(p.kids[0].n)?'su única hija':'su único hijo'),`His brother says ${p.kids[0].n}, his only child, hasn’t spoken to him since 2019.`,'estranged',[`${p.kids[0].n} no le habla: apelar a la familia no le ayuda, le recuerda lo que ha perdido.`,`${p.kids[0].n} doesn’t speak to him: appealing to family doesn’t help, it reminds him of what he lost.`]);
 else if(p.kids.length&&p.estranged) NOTE(`Su hermano dice que sus hijos no le hablan desde 2019.`,`His brother says his children haven’t spoken to him since 2019.`,'estranged',["Sus hijos no le hablan: apelar a ellos no le ayuda, le recuerda lo que ha perdido.","His children don’t speak to him: appealing to them doesn’t help, it reminds him of what he lost."]);
 if(p.hook==='hijos') NOTE(/pareja y sus hijos/.test(p.vive[0])?`Vive con ${lst(p.kids.map(k=>k.n))} y su pareja; el sábado ${p.kids[0].n} cumple ${p.kids[0].age+1} años y tienen la fiesta preparada.`:`Ve a ${lst(p.kids.map(k=>k.n))} cada fin de semana; el sábado ${p.kids[0].n} cumple ${p.kids[0].age+1} años.`,/pareja y sus hijos/.test(p.vive[0])?`He lives with ${lst(p.kids.map(k=>k.n),1)} and his partner; on Saturday ${p.kids[0].n} turns ${p.kids[0].age+1} and the party is all planned.`:`He sees ${lst(p.kids.map(k=>k.n),1)} every weekend; on Saturday ${p.kids[0].n} turns ${p.kids[0].age+1}.`,'hijos',["Sus hijos son su ancla: el cumpleaños del sábado era un gancho real.","His children are his anchor: Saturday’s birthday was a real hook."]);
 if(p.hook==='nieta') NOTE(`Recoge a su nieta ${p.nieta.n} (${p.nieta.age} años) del colegio todos los días.`,`He picks up his granddaughter ${p.nieta.n} (${p.nieta.age}) from school every day.`,'nieta',["Su nieta era su ancla: alguien que le espera mañana a las cinco.","His granddaughter was his anchor: someone waiting for him tomorrow at five."]);
 if(p.hook==='perro') NOTE(`Vive con su perro, ${p.dog}; los vecinos dicen que no se separa de él.`,`He lives with his dog, ${p.dog}; neighbours say they’re inseparable.`,'perro',["Su perro era su ancla: alguien que depende de él.","His dog was his anchor: someone who depends on him."]);
 if(p.hook==='oficio') NOTE(`${p.oficioYears} años en su oficio; muy orgullos${o} de su trabajo, según sus antiguos compañeros.`,`${p.oficioYears} years in his trade; very proud of his work, former colleagues say.`,'oficio',["Su orgullo profesional era la forma de darle una salida digna.","His professional pride was the way to give him a face-saving exit."]);
 if(p.savvy) NOTE(`Fue ${p.jobs[1][0]}: conoce los procedimientos policiales.`,`He was ${/^[aeiou]/i.test(p.jobs[1][1])?"an":"a"} ${p.jobs[1][1]}: he knows police procedures.`,'savvy',["Conoce cómo trabaja la policía: cualquier mentira o farol lo iba a detectar.","He knows how police work: he would spot any lie or bluff."]);
 if(p.trigger==='expareja') NOTE(`Orden de alejamiento de su ex-pareja desde abril de 2026.`,`Restraining order from his ex-partner since April 2026.`,'expareja',["Su ex-pareja era un detonante: meterla en la conversación lo encendía.","His ex-partner was a trigger: bringing her up set him off."]);
 if(p.trigger==='carcel') NOTE(`A su hermana le dijo que «antes muerto que volver a la cárcel».`,`He told his sister “I’d rather die than go back to prison”.`,'carcel',["La cárcel era su detonante: hablarle de años de condena era lo peor.","Prison was his trigger: talking about years inside was the worst move."]);
 if(p.trigger==='loco') NOTE(`Su hermana pide que no le hablen de medicación ni de médicos: «se siente juzgado».`,`His sister asks that nobody mention medication or doctors: “he feels judged”.`,'loco',["Tratarle como a un enfermo era un detonante: lo pedía su propia hermana.","Treating him as ill was a trigger: his own sister warned you."]);
 if(p.substance) NOTE(p.subst[0],p.subst[1],'subst',["Había bebido o consumido: el tiempo era tu aliado porque el efecto baja.","He had been drinking or using: time was on your side as the effect wears off."]);
 if(p.despair>=2) p.keys.push('despair');
 if(p.heard) p.keys.push('heard');
 if(p.inst) p.keys.push('inst');
 if(p.fem){
   const fe=s=>s.replace(/\bhimself\b/g,'herself').replace(/\bhim\b/g,'her').replace(/\bhis\b/g,'her').replace(/\bHis\b/g,'Her').replace(/\bhe\b/g,'she').replace(/\bHe\b/g,'She');
   const fs=s=>s.replace(/ con él\b/g,' con ella').replace(/ de él\b/g,' de ella').replace(/como a un loco/g,'como a una loca').replace(/^Despedido/,'Despedida').replace(/nadie le ha escuchado/g,'nadie la ha escuchado').replace(/se siente juzgado/g,'se siente juzgada');
   const fx2=a=>[fs(a[0]),fe(a[1])];
   ['vive','record','health','subst','motTxt','moodTxt','place'].forEach(k=>{ if(p[k]) p[k]=fx2(p[k]); });
   const fj=s=>[['repartidor','repartidora'],['camarero','camarera'],['mozo de almacén','moza de almacén'],['conductor de autobús','conductora de autobús'],['cocinero','cocinera'],['mecánico','mecánica'],['encargado de obra','encargada de obra'],['administrativo','administrativa'],['pescador','pescadora'],['dueño de un bar','dueña de un bar'],['carpintero jubilado','carpintera jubilada'],['profesor de instituto jubilado','profesora de instituto jubilada'],['agricultor jubilado','agricultora jubilada'],['camionero jubilado','camionera jubilada'],['electricista jubilado','electricista jubilada'],['escolta privado','escolta privada']].reduce((a,[m,f])=>a.replace(new RegExp('\\b'+m+'\\b','g'),f),s);
   const fx3=a=>[fj(fs(a[0])),fe(a[1])];
   p.jobs=p.jobs.map(fx3); p.job=p.jobs[0]; p.notes.forEach(n=>{ n.t=fx3(n.t); n.why=fx3(n.why); });
   if(p.trigger==='expareja') p.notes.forEach(n=>{ if(n.key==='expareja') n.why=["Su ex-pareja era un detonante: meterlo en la conversación la encendía.","Her ex-partner was a trigger: bringing him up set her off."]; });
 }
 p.hc=hc;
 /* variables de texto */
 const k0=p.kids[0];
 p.v={n:p.name,o:o,el:[p.fem?'ella':'él',p.fem?'she':'he'],lo:p.fem?'la':'lo',yo:yoN,cuerpo:p.corps,mom:mom.n,
   k:k0?k0.n:'',kk:[lst(p.kids.map(k=>k.n)),lst(p.kids.map(k=>k.n),1)],dog:p.dog||'',nieta:p.nieta?p.nieta.n:'',
   lug:p.place,h:p.host[0].n,hc:hc.n,cond:hc.cond,
   hche:hc.f?'she':'he',hchis:hc.f?'her':'his',hcHe:hc.f?'She':'He',un:p.fem?'una':'un',
   exla:p.fem?'lo':'la',exella:p.fem?'él':'ella',exher:p.fem?'him':'her',exshe:p.fem?'he':'she',exherself:p.fem?'himself':'herself'};
 p.sig=sig(p);
 return p;
}
function newProfile(seed){
 const H=histGet(); let s=seed, p=null;
 for(let i=0;i<25;i++){ p=makeProfile(s); if(seed!=null&&i===0&&seed===p.seed&&FORCED) break; if(H.indexOf(p.sig)<0) break; s=(s*1103515245+12345)>>>0; }
 histAdd(p.sig); return p;
}
let FORCED=false;

/* ---------------- motor de la partida ---------------- */
const PH=[["Escucha activa","Active listening"],["Empatía","Empathy"],["Rapport","Rapport"],["Influencia","Influence"],["Cambio de conducta","Behavioural change"]];
function phase(){ const r=G.trust; return r>=78?4:r>=60?3:r>=40?2:r>=20?1:0; }
const inside=()=>P.host.filter(h=>!h.out);
const hh=()=>{ const a=inside().map(h=>h.n); return a.length<=1?(a[0]||''):a.slice(0,-1).join(', ')+L(' y ',' and ')+a[a.length-1]; };
const O=(k,es,en,x)=>Object.assign({k:k,t:[es,en]},x||{});
const S2=(es,en)=>[es,en];
const LISTEN=['etiq','espejo','parafr','pausa','mini','resumen'];

function evalOpt(o){
 let [dt,dr]=BASE[o.k]; const why=[]; let rep=null; const ph=phase();
 if(o.k==='mentira'){ dt=2; dr=-2; }
 if(P.inst){ if(LISTEN.includes(o.k)) dr=Math.round(dr*0.75); if(['qpq','calib','autor','honest'].includes(o.k)){ dr=Math.round(dr*1.3); why.push(S2("Era un caso instrumental (busca algo concreto, no desahogarse): lo práctico y concreto le llegaba más.","It was an instrumental case (wanting something concrete, not to vent): practical, concrete moves reached him best.")); } }
 if(P.heard&&['etiq','parafr','resumen','espejo','digna','calib'].includes(o.k)){ dr=Math.round(dr*1.35); dt-=2; why.push(S2("En el expediente: siente que «nadie le escucha». Sentirse escuchad{o} era justo lo que necesitaba.","In the dossier: he feels “nobody listens”. Being heard was exactly what he needed.")); }
 if(P.heard&&['minim','precoz','juicio','nono'].includes(o.k)){ dt+=5; dr-=3; why.push(S2("Para alguien que siente que nadie le escucha, fue otra puerta cerrada.","For someone who feels nobody listens, it was one more closed door.")); }
 if(P.despair>=2){ if(['amenaza','prisa','juicio','minim'].includes(o.k)){ dt+=7; dr-=4; why.push(S2("A alguien al que ya le da igual vivir, la presión no le asusta: le empuja.","To someone who no longer cares about living, pressure doesn’t scare: it pushes.")); } if(['etiq','pausa','asksui','yo'].includes(o.k)) dr+=3; }
 if(P.impulsive>=2){ dt=Math.round(dt*1.25); if(['plan','honest','calib','pres'].includes(o.k)) dt-=2; }
 if(P.savvy){ const j=P.jobs[1];
   if(o.k==='mentira'){ dt+=16; dr-=14; rep=S2("¿Me tomas por tont{o}? Sé cómo montáis un operativo. Sé dónde os ponéis y cuántos sois.","You think I’m stupid? I know how you set up an operation. I know where you stand and how many of you there are."); why.push(S2(`Fue ${j[0]}: sabía cómo funciona un operativo y detectó la mentira al momento.`,`He was ${/^[aeiou]/i.test(j[1])?"an":"a"} ${j[1]}: he knew how an operation works and spotted the lie at once.`)); }
   if(o.k==='promesa'){ dt+=7; dr-=10; rep=S2("Eso no lo decides tú y los dos lo sabemos. No me vendas humo.","That’s not your call and we both know it. Don’t sell me smoke."); why.push(S2(`Fue ${j[0]}: sabía que esa promesa no estaba en tu mano.`,`He was ${/^[aeiou]/i.test(j[1])?"an":"a"} ${j[1]}: he knew that promise wasn’t yours to make.`)); }
   if(o.k==='honest'){ dr+=4; why.push(S2("Con alguien que conoce los procedimientos, la honestidad valía el doble.","With someone who knows the procedures, honesty was worth double.")); }
   if(o.k==='amenaza'){ dt-=5; dr-=3; why.push(S2("Conoce los procedimientos: sabía que era un farol, y eso te restó credibilidad.","He knows the procedures: he knew it was a bluff, and it cost you credibility.")); }
 }
 if(P.inst&&P.mood==='frio'&&['etiq','espejo','pausa','mini'].includes(o.k)){ dr=Math.round(dr*0.4); dt+=3; rep=rep||S2("No me psicoanalices. Habla de cosas concretas.","Don’t psychoanalyse me. Talk about concrete things."); why.push(S2("El expediente le describía frío y calculador: las etiquetas emocionales le sonaron a manual. Con él funcionaban las preguntas concretas y la honestidad.","The dossier described him as cold and calculating: emotional labels sounded like a textbook to him. Concrete questions and honesty worked better.")); }
 if(P.heard&&o.k==='autor'){ dt+=7; dr-=6; rep=S2("«No depende de mí.» ¡Eso es lo que llevo meses oyendo! ¡Eso es lo que me ha traído aquí!","“It’s not my call.” That’s what I’ve been hearing for months! That’s what brought me here!"); why.push(S2("En el expediente: reclamaciones sin respuesta. «No depende de mí» era justo la frase que le había llevado hasta allí.","In the dossier: complaints left unanswered. “It’s not my call” was exactly the phrase that had brought him there.")); }
 if(P.impulsive>=2&&(P.mood==='panico')&&o.k==='pausa'){ dt+=8; dr-=4; rep=S2("¡¿Por qué te callas?! ¡¿Qué estáis preparando?!","Why have you gone quiet?! What are you planning?!"); why.push(S2("Era joven y estaba en pánico (lo decía el expediente): el silencio al teléfono le sonó a que algo se preparaba. Con él, mejor frases cortas y claras.","He was young and panicking (as the dossier said): silence on the line sounded like something was being prepared. With him, short clear sentences worked better.")); }
 if(P.despair>=2&&['precoz','digna'].includes(o.k)&&!o.hook){ dt+=3; dr=Math.round(dr*0.3); why.push(S2("Con alguien que ya no espera nada del futuro, hablarle de lo que vendrá no pesa: primero había que hablar del riesgo y escucharle.","With someone who expects nothing from the future, talk of what comes next carries no weight: first you had to address the risk and listen.")); }
 if(P.substance&&['tiempo','autor','pausa','noplazo'].includes(o.k)){ dt-=3; why.push(S2("Había bebido o consumido: cada minuto que ganabas, el efecto bajaba.","He had been drinking or using: every minute you gained, the effect wore off.")); }
 if(o.hook){
   if(o.hook===P.hook){ dt-=5; dr+=6; const n=P.notes.find(x=>x.key===P.hook); if(n) why.push(S2("En el expediente: «"+n.t[0]+"» "+n.why[0],"In the dossier: “"+n.t[1]+"” "+n.why[1])); }
   else if(o.hook==='hijos'&&P.estranged){ dt+=14; dr-=12; rep=P.kids.length===1?S2("¿{k}? Hace años que no me habla. ¿Eso no lo pone en tu informe?","{k}? Hasn’t spoken to me in years. Isn’t that in your file?"):S2("¿Mis hijos? Hace años que no me hablan. ¿Eso no lo pone en tu informe?","My kids? They haven’t spoken to me in years. Isn’t that in your file?"); const n=P.notes.find(x=>x.key==='estranged'); if(n) why.push(S2("En el expediente: «"+n.t[0]+"» "+n.why[0],"In the dossier: “"+n.t[1]+"” "+n.why[1])); o.det=1; }
   else if(o.hook==='madre'&&P.keys.includes('sinmadre')){ dt+=10; dr-=8; rep=S2("¿Mi madre? Es la última persona que quiero que se meta en esto.","My mother? She’s the last person I want involved in this."); why.push(S2("En el expediente: no se habla con su madre. Era un detonante, no un ancla.","In the dossier: he doesn’t speak to his mother. A trigger, not an anchor.")); o.det=1; }
   else { dr=Math.round(dr*0.4); dt=Math.round(dt*0.4); why.push(S2("No era su punto débil: el argumento no le llegó.","That wasn’t what he cared about: the argument didn’t reach him.")); }
 }
 if(o.trig&&o.trig===P.trigger){ dt+=14; dr-=10; const n=P.notes.find(x=>x.key===P.trigger); rep=o.trigRep||rep; if(n) why.push(S2("Detonante del expediente: «"+n.t[0]+"» "+n.why[0],"Dossier trigger: “"+n.t[1]+"” "+n.why[1])); o.det=1; }
 if(['gancho','digna','plan','qpq'].includes(o.k)&&ph<1&&!(o.hook&&o.hook!==P.hook)){ dr=Math.round(dr*0.55); why.push(S2("Buena idea, pero pronto: en la escalera del FBI la influencia llega después de escuchar y crear confianza.","Good idea, but early: on the FBI stairway, influence comes after listening and building trust.")); }
 if(o.k==='plan'&&ph<3){ dr=Math.round(dr*0.5); dt+=2; }
 if(G.ap==='emocional'&&o.k==='gancho'&&o.hook===P.hook) dr+=2;
 if(G.ap==='escucha'&&LISTEN.includes(o.k)) dr+=1;
 if(G.ap==='practico'&&['calib','qpq','honest','plan','autor'].includes(o.k)) dr+=1;
 const q=(dr>=5&&dt<=0)?'good':(dr<=-3||dt>=7)?'bad':'mid';
 return {dt:dt,dr:dr,why:why,q:q,rep:rep};
}
const RG=[[S2("...Vale. Te escucho. Pero no me la juegues.","...OK. I’m listening. But don’t mess with me."),S2("(Silencio) ...Sigue hablando.","(Silence)... Keep talking."),S2("No sé ni cómo he llegado a esto.","I don’t even know how I got here.")],
 [S2("Eso es. Exactamente eso.","That’s it. Exactly that."),S2("Por fin alguien que no me grita.","Finally someone who isn’t yelling at me."),S2("Llevo toda la mañana con un nudo aquí dentro.","I’ve had a knot in here all morning.")],
 [S2("Vale, {yo}. Contigo se puede hablar.","OK, {yo}. You I can talk to."),S2("No soy mala persona, ¿sabes? No quería esto.","I’m not a bad person, you know? I didn’t want this."),S2("(Se le oye respirar más despacio.)","(You hear slower breathing on the line.)")]];
const RM=[S2("Ya... ¿Y qué?","Yeah... so what?"),S2("No sé si creerte.","Not sure I believe you."),S2("Hmm. Sigue.","Hmm. Go on."),S2("Eso dices tú.","So you say.")];
const RB=[S2("¡No me digas lo que tengo que hacer!","Don’t tell me what to do!"),S2("¡Así no vamos a ningún lado!","This is going nowhere!"),S2("¡Te estás riendo de mí!","You’re laughing at me!"),S2("(Cuelga. Tardas varios minutos en recuperar la línea.)","(The line goes dead. It takes several minutes to get it back.)"),S2("¡Estoy hart{o} de que me habléis así!","I’m sick of being spoken to like that!")];
function hookOpt(h){
 const T_={hijos:P.estranged?(P.kids.length===1?S2("Piensa en {k}, {n}. No querría verte así.","Think of {k}, {n}. They wouldn’t want to see you like this."):S2("Piensa en tus hijos, {n}. Ellos no querrían verte así.","Think of your children, {n}. They wouldn’t want to see you like this.")):((G.saidO||{})[L("{k} quiere verte el sábado. Eso todavía está en tu mano.","{k} wants to see you on Saturday. That’s still in your hands.")]?S2("{k} cumple años el sábado y te está esperando. Todavía puedes estar ahí.","{k} has a birthday on Saturday and is waiting for you. You can still be there."):S2("{k} quiere verte el sábado. Eso todavía está en tu mano.","{k} wants to see you on Saturday. That’s still in your hands.")),
  madre:P.hook==='madre'?S2("Tu madre está aquí fuera, {n}. Quiere verte salir bien. Hazlo por ella.","Your mother is out here, {n}. She wants to see you come out OK. Do it for her."):S2("Piensa en tu madre, {n}. Seguro que quiere verte salir bien de esta.","Think of your mother, {n}. She’d surely want to see you come out of this OK."),
  nieta:S2("{nieta} te va a esperar a la salida del colegio. Vamos a trabajar para que esto acabe bien.","{nieta} will be waiting for you outside school. Let’s work so this ends well."),
  perro:S2("{dog} te está esperando en casa. Vamos a buscar la forma de que esto acabe bien.","{dog} is waiting for you at home. Let’s find a way for this to end well."),
  oficio:S2("Toda una vida trabajando con tus manos, {n}. Eso no lo borra un mal día.","A whole life working with your hands, {n}. One bad day doesn’t erase that.")};
 const OK={hijos:(G.saidO||{})[L("{k} quiere verte el sábado. Eso todavía está en tu mano.","{k} wants to see you on Saturday. That’s still in your hands.")]?S2("(Silencio largo) ...Quiero estar ahí. Quiero estar.","(Long silence)... I want to be there. I really do."):S2("{k}... (se le quiebra la voz). Le prometí que iría a su cumpleaños.","{k}... (the voice cracks). I promised I’d be at the birthday."),madre:S2("(Larga pausa) ...Dile que estoy bien. Que lo siento.","(Long pause)... Tell her I’m OK. That I’m sorry."),nieta:S2("A las cinco. Siempre llego a las cinco. Nunca he llegado tarde.","At five. I always get there at five. I’ve never been late."),perro:S2("{dog} no tiene a nadie más. Nadie más le saca a pasear.","{dog} has nobody else. Nobody else walks him."),oficio:S2("(Ríe, cansad{o}) Hice el portón de la iglesia del pueblo, ¿sabes? Sigue ahí.","(A tired laugh) I made the church door in my village, you know? It’s still there.")};
 return O(h==='oficio'?'digna':'gancho',T_[h][0],T_[h][1],{hook:h,ok:OK[h]});
}
function M_contacto(){
 const SAY={panico:S2("¡¿Quién eres?! ¡Como entre alguien aquí, no respondo! ¡¿Me oyes?!","Who are you?! If anyone comes in here, I won’t answer for what happens! You hear me?!"),
  ira:S2("¡Ya era hora! ¡Quiero hablar con alguien que mande, no con un mandado!","About time! I want someone in charge, not an errand runner!"),
  triste:S2("(Tarda en contestar) ...¿Sí? No sé ni qué estoy haciendo.","(Takes a while to answer)... Yes? I don’t even know what I’m doing."),
  frio:S2("Ya sé cómo va esto. Tú hablas, yo escucho. ¿Qué ofrecéis?","I know how this works. You talk, I listen. What are you offering?"),
  apatia:S2("...¿Y ahora qué? Da igual lo que digas.","...So now what? It doesn’t matter what you say.")};
 const o=[O('pres',"Me llamo {yo}, de la {cuerpo}. No me voy a ningún sitio: estoy aquí para hablar contigo. ¿Qué está pasando ahí dentro?","My name’s {yo}, from the {cuerpo}. I’m not going anywhere: I’m here to talk with you. What’s going on in there?",{ok:S2("...Lo que pasa es que todo se ha torcido. Eso pasa.","...What’s going on is it’s all gone wrong. That’s what.")}),
  O('calma',"Cálmate. Suelta a todo el mundo y sal con las manos en alto.","Calm down. Let everyone go and come out with your hands up."),
  O('amenaza',"Escúchame bien: el edificio está rodeado y no tienes salida.","Listen carefully: the building is surrounded and there’s no way out.")];
 if(RND()<0.5) o.push(O('mini',"Te escucho, {n}. Cuéntame qué necesitas que sepa.","I’m listening, {n}. Tell me what you need me to know.",{ok:S2("...¿Cómo sabes mi nombre? Da igual. Necesito que nadie entre.","...How do you know my name? Never mind. I need nobody to come in.")}));
 if(P.hook&&RND()<0.6) o.push(hookOpt(P.hook)); else if(P.estranged&&RND()<0.6) o.push(hookOpt('hijos'));
 return {say:SAY[P.mood],o:o,n:3,need:['pres','mini']};
}

const DES={
 deudas:[["Debo un dinero que no tengo a gente que no perdona. ¿Sabes lo que es mirar por la ventana cada noche?","I owe money I don’t have to people who don’t forgive. Know what it’s like checking the window every night?","¿Gente que no perdona?","People who don’t forgive?"],["Me iban a quitar todo igual. Por lo menos así...","They were going to take everything anyway. At least this way...","¿Por lo menos así...?","At least this way...?"]],
 golpe:[["Esto tenía que durar tres minutos. Tres. Alguien ha hablado.","This was meant to take three minutes. Three. Someone talked.","¿Alguien ha hablado?","Someone talked?"],["Lo tenía todo medido. Todo. Y ha saltado la alarma.","I had it all worked out. All of it. And the alarm went off.","¿Ha saltado la alarma?","The alarm went off?"]],
 adiccion:[["No he dormido en tres días. Solo necesitaba el dinero, ¿vale? No quería a nadie aquí.","I haven’t slept in three days. I just needed the money, OK? I didn’t want anyone here.","¿No querías a nadie aquí?","You didn’t want anyone here?"],["Me tiemblan las manos. No estoy bien, no estoy bien...","My hands are shaking. I’m not OK, I’m not OK...","¿No estás bien?","You’re not OK?"]],
 paro:[["Dos años mandando currículos. Dos años. Y el día 30 me echan del piso.","Two years sending CVs. Two years. And on the 30th I’m out of my flat.","¿Te echan del piso?","You’re out of your flat?"],["Ya no sé ni qué decirle a la gente cuando me pregunta a qué me dedico.","I don’t even know what to say when people ask what I do.","¿Qué decirle a la gente?","What to tell people?"]],
 desahucio:[["Treinta años pagando esa casa. Me sacaron con mis cosas en bolsas de basura. Y aquí nadie me ha contestado ni una carta.","Thirty years paying for that house. They put my things out in bin bags. And nobody here answered a single letter.","¿Ni una carta?","Not a single letter?"],["Cuatro reclamaciones. Cuatro. ¿Sabes cuántas me han contestado?","Four complaints. Four. Know how many they answered?","¿Cuántas te han contestado?","How many did they answer?"]],
 despido:[["Diecinueve años en esta empresa. ¡Diecinueve! Y me echan con un correo. Ni me miraron a la cara.","Nineteen years at this company. Nineteen! And they fire me by email. Didn’t even look me in the face.","¿Ni te miraron a la cara?","Didn’t even look you in the face?"],["Yo abría esta oficina antes que nadie. Yo. Y ahora soy un número.","I opened this office before anyone. Me. And now I’m a number.","¿Ahora eres un número?","Now you’re a number?"]],
 seguro:[["Mi taller se quemó y estos me hablan de la letra pequeña... ¡La letra pequeña! Toda mi vida en ese taller.","My workshop burned down and these people talk about the small print... The small print! My whole life in that workshop.","¿Toda tu vida?","Your whole life?"],["Pagué el seguro veintidós años sin fallar un mes. Y cuando lo necesito, nada.","I paid that insurance twenty-two years without missing a month. And when I need it, nothing.","¿Cuando lo necesitas, nada?","When you need it, nothing?"]],
 huida:[["No pienso volver dentro. No sabes lo que es aquello.","I’m not going back inside. You don’t know what it’s like.","¿No sé lo que es aquello?","I don’t know what it’s like?"],["Solo quería ver a mi gente. Nueve días fuera. Nueve.","I just wanted to see my people. Nine days out. Nine.","¿Ver a tu gente?","See your people?"]]};
const LAB={deudas:S2("Parece que llevas mucho tiempo con miedo, sin poder respirar.","It sounds like you’ve been scared for a long time, unable to breathe."),golpe:S2("Suena a que te sientes traicionad{o}: lo tenías todo pensado y alguien lo ha estropeado.","It sounds like you feel betrayed: you had it all planned and someone ruined it."),adiccion:S2("Parece que estás agotad{o} y que ya no puedes más.","It sounds like you’re exhausted and can’t take any more."),paro:S2("Suena a que sientes que nadie te da una oportunidad.","It sounds like you feel nobody gives you a chance."),desahucio:S2("Parece que te sientes humillad{o}: te quitaron tu casa y encima nadie te contesta.","It sounds like you feel humiliated: they took your home and nobody even answers you."),despido:S2("Suena a que lo que más te duele no es el despido, sino cómo lo hicieron.","It sounds like what hurts most isn’t being fired, it’s how they did it."),seguro:S2("Parece que sientes que te han robado toda una vida de trabajo.","It sounds like you feel a lifetime of work has been stolen from you."),huida:S2("Suena a que lo que te da miedo es volver a lo que viviste allí.","It sounds like what scares you is going back to what you lived through there.")};
const PRE={deudas:S2("Si sales ahora, te ayudamos con lo de la deuda.","If you come out now, we’ll help you with the debt."),golpe:S2("Si sales ahora, esto se queda en un intento.","If you come out now, this stays an attempt."),adiccion:S2("Si sales ahora, te buscamos un centro y lo arreglamos.","If you come out now, we’ll find you a clinic and sort it out."),paro:S2("Si sales ahora, te ayudamos a buscar trabajo.","If you come out now, we’ll help you find work."),desahucio:S2("Si sales ahora, hablamos con el banco lo de tu casa.","If you come out now, we’ll talk to the bank about your house."),despido:S2("Si sales ahora, hablamos con la empresa para que te readmitan.","If you come out now, we’ll talk to the company about taking you back."),seguro:S2("Si sales ahora, hacemos que el seguro te pague.","If you come out now, we’ll make the insurer pay."),huida:S2("Si sales ahora, hablamos con el juez para que no vuelvas dentro.","If you come out now, we’ll talk to the judge so you don’t go back inside.")};
function M_desahogo(){
 const v=pick(DES[P.motive]);
 const o=[O('etiq',LAB[P.motive][0],LAB[P.motive][1],{ok:S2("...Sí. Eso. Es exactamente eso.","...Yes. That. That’s exactly it.")}),
  O('minim',"Hombre, tampoco es para tanto. Todo tiene solución.","Come on, it’s not that bad. Everything can be sorted."),
  O('juicio',"Eso no justifica lo que estás haciendo, y lo sabes.","That doesn’t justify what you’re doing, and you know it."),
  O('precoz',PRE[P.motive][0],PRE[P.motive][1])];
 if(RND()<0.5) o.push(O('pausa',"(Le dejas terminar y guardas unos segundos de silencio.)","(You let him finish and stay silent for a few seconds.)",{ok:S2("...¿Sigues ahí? Vale. Es que nunca se lo había contado a nadie.","...You still there? OK. It’s just I’ve never told anyone this.")}));
 if(RND()<0.6) o.push(O('espejo',v[2],v[3],{ok:S2("Eso. Y lo peor es que nadie te pregunta cómo estás.","Yes. And the worst part is nobody asks how you are.")}));
 if(P.trigger==='loco'||RND()<0.25) o.push(O('juicio',"¿Estás tomando tu medicación, {n}?","Are you taking your medication, {n}?",{trig:'loco',trigRep:S2("¡¿Ves?! ¡Ya estamos! ¡Para vosotros soy {un} loc{o} y punto!","See?! There we go! To you lot I’m just a nutcase!")}));
 return {say:S2(v[0],v[1]),o:o,n:4,need:['etiq','espejo']};
}
function M_exigencia(){
 const t=P.trigger==='expareja'&&RND()<0.6?'ex':P.heard?pick(['jefe','medios']):pick(['coche','dinero']);
 G.dem=t;
 const SAY={coche:S2("Quiero un coche en la puerta. Depósito lleno. Tienes una hora.","I want a car at the door. Full tank. You’ve got an hour."),
  dinero:S2("Quiero cincuenta mil euros en una bolsa y que nadie me siga.","I want fifty thousand euros in a bag and nobody following me."),
  jefe:P.motive==='seguro'?S2("Quiero que venga el director de la aseguradora y me pida perdón delante de todos.","I want the insurer’s director here, apologising in front of everyone."):S2("Quiero que venga el director general y me pida perdón delante de todos.","I want the managing director here, apologising in front of everyone."),
  medios:S2("Quiero que venga la tele. Que todo el mundo sepa lo que me han hecho.","I want the TV here. Everyone should know what they did to me."),
  ex:S2("Quiero hablar con mi ex. ¡Ponla al teléfono! ¡Ahora!","I want to talk to my ex. Put her on the phone! Now!")};
 let o;
 if(t==='coche'||t==='dinero') o=[O('calib',"Te escucho. ¿Cómo quieres que lo haga sin que nadie salga herido, ni tú tampoco?","I hear you. How do you want me to do that without anyone getting hurt, you included?",{ok:S2("...No sé. No lo había pensado así.","...I don’t know. Hadn’t thought of it that way.")}),
   O('autor',"Eso no depende de mí; tengo que consultarlo y llevará tiempo. Mientras, cuéntame: ¿cómo estáis ahí dentro?","That’s not my call; I have to check and it’ll take time. Meanwhile, tell me: how are you all doing in there?",{ok:S2("Pues... aquí estamos. Hace un calor horrible.","Well... here we are. It’s horribly hot.")}),
   O('promesa',t==='coche'?"Hecho. En una hora lo tienes en la puerta.":"Hecho. Te consigo el dinero.",t==='coche'?"Done. You’ll have it at the door in an hour.":"Done. I’ll get you the money.",{prom:1,ok:S2("...Vale. Más te vale.","...OK. You’d better.")}),
   O('nono',"Eso es imposible. Olvídalo.","That’s impossible. Forget it.")];
 else if(t==='jefe') o=[O('calib',"¿Qué necesitarías oír de él para que esto se pueda terminar?","What would you need to hear from him for this to be able to end?",{ok:S2("Que lo reconozca. Que me miren a la cara y digan que se equivocaron.","That they admit it. Look me in the face and say they were wrong.")}),
   O('tiempo',"No puedo traer a nadie aquí, pero sí puedo escuchar todo lo que le dirías. Empieza por el principio.","I can’t bring anyone here, but I can hear everything you’d say to him. Start from the beginning.",{ok:S2("El principio... El principio fue hace veinte años.","The beginning... The beginning was twenty years ago.")}),
   O('tpi',"Vale, voy a buscarle y te lo paso al teléfono.","OK, I’ll find him and put him on the phone."),
   O('autor',"Eso no depende de mí; lo consulto con mis jefes y te digo algo.","That’s not my call; I’ll check with my bosses and get back to you."),
   O('nono',"Eso no va a pasar.","That’s not happening.")];
 else if(t==='medios') o=[O('tiempo',"Cuéntamelo a mí primero, entero. Quiero entenderlo bien.","Tell me first, all of it. I want to understand it properly.",{ok:S2("¿De verdad quieres oírlo? Vale. Te lo cuento.","You really want to hear it? Fine. I’ll tell you.")}),
   O('medios',"Vale, llamo a la tele ahora mismo.","OK, I’ll call the TV right now."),
   O('autor',"Eso no depende de mí; tengo que consultarlo.","That’s not my call; I have to check."),
   O('promesa',"Te prometo que mañana sales en todos los periódicos.","I promise you’ll be in every paper tomorrow.",{prom:1}),
   O('nono',"Nadie va a venir a grabarte.","Nobody’s coming to film you.")];
 else o=[O('calib',"No voy a meter a nadie más en esto. Pero cuéntame: ¿qué le dirías?","I’m not bringing anyone else into this. But tell me: what would you say to {exher}?",{ok:S2("Que me dejó sin nada. Que me quitó a los niños. (Se calla.)","That {exshe} left me with nothing. Took the kids. (Silence.)")}),
   O('tpi',"Vale, {exla} busco y te {exla} pongo.","OK, I’ll find {exher} and put {exher} on.",{trig:'expareja',trigRep:S2("¡Que se ponga! ¡Que me lo explique delante de todos!","Put {exher} on! Let {exher} explain {exherself} in front of everyone!")}),
   O('juicio',"Con una orden de alejamiento, ¿todavía quieres hablar con {exella}?","With a restraining order, you still want to talk to {exher}?",{trig:'expareja',trigRep:S2("¡Esa orden es mentira! ¡Todo es mentira!","That order is a lie! It’s all lies!")}),
   O('nono',"Ni lo sueñes.","Not a chance.")];
 return {say:SAY[t],o:o,n:RND()<0.5?4:3,need:['calib','autor','tiempo']};
}
function M_plazo(){
 const say=pick([S2("Te doy treinta minutos. Si no tengo lo que he pedido, esto se pone feo.","You’ve got thirty minutes. If I don’t have what I asked for, this gets ugly."),S2("A la hora en punto se me acaba la paciencia. Tú verás.","On the hour my patience runs out. Your call.")]);
 const o=[O('noplazo',"Te oigo. No hace falta poner relojes: estamos hablando tú y yo, y no me voy. ¿Qué es lo que más te preocupa ahora mismo?","I hear you. No need for clocks: it’s you and me talking, and I’m not leaving. What worries you most right now?",{ok:S2("Lo que me preocupa... es cómo salgo de esta.","What worries me... is how I get out of this.")}),
  O('promesa',"Vale, en treinta minutos lo tienes.","OK, you’ll have it in thirty minutes.",{prom:1}),
  O('amenaza',"Si le tocas un pelo a alguien, entramos.","Touch a hair on anyone and we come in."),
  O('pausa',"(Dejas unos segundos de silencio.) ...Sigo aquí, {n}.","(You leave a few seconds of silence.)... I’m still here, {n}.",{ok:S2("...Ya. Ya sé que sigues ahí.","...Yeah. I know you’re still there.")})];
 return {say:say,o:o,n:3,need:['noplazo','pausa']};
}

function M_gancho(){
 let say, h=P.hook; const o=[]; const kid=P.kids[0];
 if(h==='hijos') say=S2(`Mi ${kid.n}... el sábado cumple ${kid.age+1}. Vaya regalo le voy a dar, ¿eh?`,`My ${kid.n}... turns ${kid.age+1} on Saturday. Some present I’m giving, eh?`);
 else if(h==='madre') say=S2("Mi madre estará viendo esto en la tele. No se lo merece.","My mother will be watching this on TV. She doesn’t deserve this.");
 else if(h==='nieta') say=S2(`Mañana tenía que recoger a ${P.nieta.n} del colegio. A las cinco.`,`Tomorrow I was supposed to pick ${P.nieta.n} up from school. At five.`);
 else if(h==='perro') say=S2(`${P.dog} lleva solo desde esta mañana. No ha comido.`,`${P.dog} has been alone since this morning. He hasn’t eaten.`);
 else if(h==='oficio') say=S2("Cuarenta años trabajando con las manos, y mira cómo acabo.","Forty years working with my hands, and look how I end up.");
 else if(P.estranged&&RND()<0.5) say=P.kids.length===1?S2("{k} ni se va a enterar. Hace años que no sabe nada de mí.","{k} won’t even find out. Hasn’t heard from me in years."):S2("Mis hijos ni se van a enterar. Hace años que no saben nada de mí.","My kids won’t even find out. They haven’t heard from me in years.");
 else say=S2("No tengo a nadie. A nadie le va a importar lo que me pase.","I’ve got nobody. Nobody will care what happens to me.");
 if(h) o.push(hookOpt(h)); else if(P.estranged) o.push(hookOpt('hijos')); else if(P.keys.includes('sinmadre')) o.push(hookOpt('madre'));
 o.push(O('etiq',h?"Suena a que te pesa mucho pensar en eso ahora mismo.":"Suena a que te sientes muy sol{o}.",h?"It sounds like thinking about that weighs on you a lot right now.":"It sounds like you feel very alone.",{ok:S2("...Mucho. Más de lo que crees.","...A lot. More than you think.")}));
 if(!h){ o.push(O('yo',"A mí me importa, {n}. Por eso sigo aquí.","It matters to me, {n}. That’s why I’m still here.",{ok:S2("(Silencio largo.) ...¿En serio?","(Long silence.)... Seriously?")})); o.push(O('minim',"Eso no es verdad, seguro que hay alguien.","That’s not true, there must be someone.")); }
 o.push(O('juicio',"Pues haberlo pensado antes de meterte ahí.","Well, you should have thought of that before going in there."));
 return {say:say,o:o,n:3,need:['gancho','digna','etiq','yo']};
}
function M_rehen(){
 const hc=P.hc, c=hc.cond, a=hc.f?'a':'o', he='{hche}', his='{hchis}';
 const say=S2(`${hc.n} dice que ${c[4]} ${c[0]} y que necesita su ${c[2]}. Está muy pálid${a}.`,`${hc.n} says ${he} ${c[5]} ${c[1]} and needs ${his} ${c[3]}. {hcHe} looks very pale.`);
 const o=[O('qpq',"Te propongo algo: dejas salir a {hc} y yo te mando agua y algo de comer para los demás.","Here’s a deal: you let {hc} out and I send in water and something to eat for the others.",{rel:hc,ok:S2("...Vale. Que salga {hc}. Pero manda el agua.","...OK. {hc} can go. But send the water.")}),
  O('calib',`¿Cómo podemos hacer para que {hc} tenga su ${c[2]}?`,`How can we get {hc} ${his} ${c[3]}?`,{rel:hc,ok:S2("...Mejor que salga. No quiero problemas con eso.","...Better they go out. I don’t want trouble over that.")}),
  O('amenaza',"Si le pasa algo a {hc}, será culpa tuya.","If anything happens to {hc}, it’s on you."),
  O('cargada',"Los rehenes no te sirven de nada, {n}.","The hostages are no use to you, {n}.")];
 return {say:say,o:o,n:3,need:['qpq','calib']};
}
function M_trampa(){
 const v=RND();
 const say=v<0.4?S2("¿Hay francotiradores ahí fuera? Y no me mientas.","Are there snipers out there? And don’t lie to me."):v<0.7?S2("¿Me estáis grabando? ¿Cuántos sois?","Are you recording me? How many of you are there?"):S2("He oído pasos en la escalera. ¿Vais a entrar?","I heard footsteps on the stairs. Are you coming in?");
 const o=[O('honest',"No te voy a mentir: hay agentes fuera, es su trabajo. El mío es que esto acabe sin que nadie salga herido, y por eso hablo contigo.","I won’t lie to you: there are officers outside, it’s their job. Mine is to end this without anyone hurt, and that’s why I’m talking to you.",{ok:S2("...Por lo menos no me mientes. Eso ya es algo.","...At least you don’t lie to me. That’s something.")}),
  O('mentira',"No hay nadie, solo estoy yo.","There’s nobody, just me.",{lie:1}),
  O('evasiva',"Eso ahora no importa.","That doesn’t matter right now.")];
 if(v>=0.7) o.push(O('promesa',"Nadie va a entrar, te lo garantizo.","Nobody’s coming in, I guarantee it.",{prom:1}));
 return {say:say,o:o,n:3,need:['honest']};
}
function M_desesperanza(){
 const say=pick([S2("¿Sabes qué? Me da igual cómo acabe. Igual lo mejor es que acabe todo hoy.","You know what? I don’t care how it ends. Maybe it’s best if it all ends today."),S2("Ya no tengo nada que perder. Nada. Eso es lo que no entendéis.","I’ve got nothing left to lose. Nothing. That’s what you don’t get.")]);
 const o=[O('asksui',"{n}, te lo pregunto directamente porque me importa: ¿estás pensando en quitarte la vida?","{n}, I’m asking you straight because it matters to me: are you thinking about ending your life?",{ok:S2("...Sí. Lo he pensado. Nadie me lo había preguntado nunca así.","...Yes. I’ve thought about it. Nobody’s ever asked me like that.")}),
  O('minim',"No digas tonterías.","Don’t talk nonsense."),
  O('etiq',"Suena a que estás muy cansad{o} de todo.","It sounds like you’re very tired of everything.",{ok:S2("Cansad{o} no. Agotad{o}. Años así.","Not tired. Exhausted. Years of it.")}),
  O('amenaza',"Piensa en lo que te va a pasar si haces una tontería.","Think about what will happen to you if you do something stupid.")];
 if(P.hook) o.push(hookOpt(P.hook)); else if(P.estranged) o.push(hookOpt('hijos'));
 return {say:say,o:o,n:G.tension>75?2:3,need:['asksui','etiq']};
}
function M_consecuencias(){
 const say=pick([S2("¿Y qué me pasa si salgo? Dímelo claro.","And what happens to me if I come out? Straight answer."),S2("Si salgo, ¿cuánto me cae? No me dores la píldora.","If I come out, how long do I get? Don’t sugar-coat it.")]);
 const o=[((G.saidO||{})[L("No te voy a prometer lo que decida un juez. Lo que sí te digo: ahora mismo nadie está herido, y eso cuenta mucho. Y voy a estar ahí cuando salgas.","I won’t promise what a judge will decide. What I can tell you: right now nobody’s hurt, and that counts for a lot. And I’ll be there when you come out.")]?O('honest',"Te lo digo claro: eso lo decide un juez, no yo, y no te voy a engañar. Lo que cuenta a tu favor es que nadie ha salido herido. Y voy a estar contigo cuando salgas.","Straight answer: a judge decides that, not me, and I won’t lie to you. What counts in your favour is that nobody’s been hurt. And I’ll be with you when you come out.",{ok:S2("...Vale. Por lo menos no me mientes.","...OK. At least you’re not lying to me.")}):O('honest',"No te voy a prometer lo que decida un juez. Lo que sí te digo: ahora mismo nadie está herido, y eso cuenta mucho. Y voy a estar ahí cuando salgas.","I won’t promise what a judge will decide. What I can tell you: right now nobody’s hurt, and that counts for a lot. And I’ll be there when you come out.",{ok:S2("...Nadie está herido. Eso es verdad.","...Nobody’s hurt. That’s true.")})),
  O('promesa',"No te va a pasar nada, te lo prometo.","Nothing will happen to you, I promise.",{prom:1}),
  O('amenaza',"Te van a caer muchos años de cárcel, eso seguro.","You’re going to get a lot of years in prison, that’s for sure.",{trig:'carcel',trigRep:S2("¡A la cárcel no vuelvo! ¡Ni lo menciones!","I’m not going back to prison! Don’t even say it!")})];
 if(inside().length) o.push(O('digna',"Hasta ahora has cuidado de {h}. Nadie ha salido herido por ti. Eso se va a saber.","So far you’ve looked after {h}. Nobody’s been hurt because of you. That will be known.",{ok:S2("Yo no quería hacer daño a nadie. Nunca.","I never wanted to hurt anyone. Never.")}));
 if(P.hook==='oficio'&&RND()<0.6) o.push(hookOpt('oficio'));
 return {say:say,o:o,n:RND()<0.5?4:3,need:['honest','digna']};
}
function M_reclamo(){
 const lie=G.pend&&G.pend.lie;
 const say=lie?S2("¡He visto a uno en el tejado de enfrente! ¡Me dijiste que no había nadie!","I saw one on the roof opposite! You told me there was nobody!"):S2("¡¿Dónde está lo que me prometiste?! ¡Me has mentido!","Where’s what you promised me?! You lied to me!");
 const o=[O('honest',"Tienes razón. Te dije algo que no podía cumplir. Me equivoqué, y no te lo voy a volver a hacer.","You’re right. I told you something I couldn’t deliver. I was wrong, and I won’t do it to you again.",{fix:1,ok:S2("...Por lo menos lo reconoces.","...At least you admit it.")}),
  O('mentira',"Está todo en camino, dame diez minutos.","It’s all on its way, give me ten minutes.",{lie:1,again:1}),
  O('evasiva',"Eso ahora da igual.","That doesn’t matter now.")];
 return {say:say,o:o,n:3,need:['honest'],claim:1};
}
function M_medios(){
 const say=S2("¡Estoy saliendo en la tele! ¡Hay un helicóptero! ¿Lo estáis viendo todos?","I’m on TV! There’s a helicopter! Is everyone watching?");
 const o=[O('foco',"Lo que importa no está en la tele, está ahí dentro contigo. ¿Cómo estáis?","What matters isn’t on TV, it’s in there with you. How are you all doing?",{ok:S2("...Mal. Hace calor y nadie ha comido.","...Bad. It’s hot and nobody’s eaten.")}),
  O('medios',"Sí, te está viendo toda España.","Yes, the whole of Spain is watching you."),
  O('calma',"Apaga eso y cálmate de una vez.","Turn that off and calm down, now.")];
 G.media=1; return {say:say,o:o,n:3,need:['foco']};
}
function M_familiar(){
 let who, wk;
 if(P.hook==='madre'){ who=S2(`su madre, ${P.mom.n},`,`${P.fem?'her':'his'} mother, ${P.mom.n},`); wk='madre'; }
 else if(P.trigger==='expareja'){ who=S2("su ex-pareja","the ex-partner"); wk='ex'; }
 else if(P.estranged){ who=S2("su hijo mayor","the eldest son"); wk='hijo'; }
 else { who=S2("su hermana","the sister"); wk='hermana'; }
 const him=P.fem?'her':'him';
 const say=S2(`El mando te avisa: ${who[0]} está en el cordón y pide hablar con ${P.fem?'ella':'él'}.`,`Command tells you: ${who[1]} is at the cordon and wants to talk to ${him}.`);
 const o=[O('tpi',"Le paso el teléfono para que hable con {n}.","I hand over the phone so they can talk to {n}.",{trig:wk==='ex'?'expareja':null}),
  O('fuente',"Le pido que me cuente cosas de {n} que me ayuden, pero sigo hablando yo.","I ask them to tell me things about {n} that help, but I keep doing the talking.",{tip:1}),
  O('gancho',`Le digo a {n} que ${who[0].replace(/,$/,'')} está aquí y le espera.`,`I tell {n} that ${who[1].replace(/,$/,'')} is here waiting.`,{hook:wk==='madre'?'madre':wk==='hijo'?'hijos':'x',trig:wk==='ex'?'expareja':null})];
 return {say:say,o:o,n:3,need:['fuente'],cmd:1};
}
function M_ruido(){
 const say=S2("¡¿Qué ha sido ese ruido?! ¡¿Estáis entrando?!","What was that noise?! Are you coming in?!");
 const o=[O('honest',"No sé qué ha sido; lo compruebo y te lo digo enseguida. Sigo aquí contigo.","I don’t know what it was; I’ll check and tell you right away. I’m still here with you.",{ok:S2("...Vale. Dímelo. Pero dímelo de verdad.","...OK. Tell me. But tell me the truth.")}),
  O('promesa',"Nadie va a entrar, te lo garantizo.","Nobody’s coming in, I guarantee it.",{prom:1}),
  O('amenaza',"Si sigues así, entraremos.","Keep this up and we’ll come in.")];
 return {say:say,o:o,n:3,need:['honest']};
}
function M_salida(){
 const say=G.sumDone?S2("Eso es. Eso es justo lo que me pasa... Vale. ¿Cómo lo hago?","That’s right. That’s exactly it... OK. How do I do this?"):pick([S2("Vale... ¿Y cómo lo hago? No quiero que me disparen al salir.","OK... how do I do this? I don’t want to get shot coming out."),S2("Estoy cansad{o}, {yo}. ¿Cómo salgo de esta?","I’m tired, {yo}. How do I get out of this?")]);
 const ins=inside().length;
 const o=[O('plan',ins?"Lo hacemos juntos y despacio: primero salen "+hh()+", luego tú, con las manos vacías y a la vista. Yo te voy diciendo cada paso.":"Lo hacemos juntos y despacio: sales con las manos vacías y a la vista. Yo te voy diciendo cada paso.",ins?"We do it together and slowly: first "+hh()+" come out, then you, hands empty and visible. I’ll talk you through every step.":"We do it together and slowly: you come out with your hands empty and visible. I’ll talk you through every step.",{exit:1,ok:S2("...Vale. Vale. Dime cuándo.","...OK. OK. Tell me when.")}),
  O('prisa',"Sal ya y no hagas tonterías.","Come out now and don’t do anything stupid."),
  O('cargada',"Entonces, ¿te rindes?","So, you’re surrendering?")];
 if(!G.sumDone) o.push(O('resumen',"A ver si lo he entendido: estás agotad{o}, no querías que esto pasara y quieres salir de aquí enter{o}. ¿Es así?","Let me see if I’ve got it: you’re exhausted, you never wanted this to happen and you want to walk out of here in one piece. Is that it?",{sum:1,ok:S2("...Eso es. Eso es.","...That’s right. That’s right.")}));
 return {say:say,o:o,n:3,need:['plan','resumen']};
}
const MOM={contacto:M_contacto,desahogo:M_desahogo,exigencia:M_exigencia,plazo:M_plazo,gancho:M_gancho,rehen:M_rehen,trampa:M_trampa,desesperanza:M_desesperanza,consecuencias:M_consecuencias,reclamo:M_reclamo,medios:M_medios,familiar:M_familiar,ruido:M_ruido,salida:M_salida};

function nextType(ex){
 ex=ex||{}; const ph=phase(), u=G.used, last=G.lastType, t=G.turn;
 if(t===0) return 'contacto';
 if(G.pend&&t>=G.pend.at) return 'reclamo';
 if(ph>=4&&G.tension<60) return 'salida';
 const W={desahogo:(ph<=1?3:1)*((u.desahogo||0)<2?1:0)*(G.ap==='escucha'?1.3:1),
  exigencia:(ph<=2?2:0.4)*((u.exigencia||0)<(P.inst?2:1)?1:0)*(G.ap==='practico'?1.3:1),
  plazo:((G.tension>55||P.inst||G.ap==='firme')&&!u.plazo&&t>=2)?1.4:0,
  gancho:(ph>=1?2.4:0.5)*((u.gancho||0)<2?1:0)*(G.ap==='emocional'?1.5:1),
  rehen:(ph>=1&&!P.hc.out&&!u.rehen)?2:0,
  trampa:!u.trampa?(P.savvy?2.2:1.1):0,
  desesperanza:(P.despair>=1?(ph>=1?2.6:1):(G.tension>80?0.6:0))*((u.desesperanza||0)<(P.despair>=2?2:1)?1:0),
  consecuencias:(ph>=2?2.6:0)*((u.consecuencias||0)<2?1:0)*(G.ap==='practico'?1.4:1),
  medios:(t>=4&&!u.medios)?0.8:0,
  familiar:(t>=3&&!u.familiar)?1:0,
  ruido:(t>=3&&!u.ruido)?0.6:0};
 delete W[last]; for(const k in ex) delete W[k];
 let sum=0; for(const k in W) sum+=W[k];
 if(sum<=0) return last==='desahogo'?'gancho':'desahogo';
 let r=RND()*sum; for(const k in W){ r-=W[k]; if(r<=0) return k; }
 return 'desahogo';
}
function buildTurn(){
 G.saids=G.saids||{}; const ex={}; let type, m;
 const SO0=G.saidO||{};
 for(let k=0;k<7;k++){ type=nextType(ex); m=MOM[type](); const key=T(m.say); const gd=m.o.filter(o=>evalOpt(Object.assign({},o)).q==='good'); const stale=gd.length&&gd.every(o=>SO0[T(o.t)]); /* si la única buena ya la dijiste, mejor otro momento */ if(((!G.saids[key]&&!stale)||type==='salida'||type==='reclamo'||k===6)) break; ex[type]=1; }
 G.saids[T(m.say)]=1; G.lastType=type; G.used[type]=(G.used[type]||0)+1;
 let ev=m.o.map(o=>({o:o,e:evalOpt(Object.assign({},o))}));
 /* no ofrecer otra vez una frase que ya dijiste (si quedan opciones de sobra y alguna buena) */ { const SO=G.saidO||{}; const fr=ev.filter(x=>!SO[T(x.o.t)]); if(fr.length>=Math.min(2,ev.length)&&(fr.some(x=>x.e.q==='good')||!ev.some(x=>x.e.q==='good'))) ev=fr; }
 let goods=shuf(ev.filter(x=>x.e.q==='good')), rest=shuf(ev.filter(x=>x.e.q!=='good'));
 const n=Math.min(m.n,ev.length); const sel=[];
 if(goods.length) sel.push(goods.shift()); else { const nd=rest.find(x=>m.need&&m.need.includes(x.o.k)); if(nd){ sel.push(nd); rest=rest.filter(x=>x!==nd); } }
 const traps=rest.filter(x=>TECH[x.o.k][3]===1&&x.e.q!=='good'); if(traps.length&&sel.length<n){ sel.push(traps[0]); rest=rest.filter(x=>x!==traps[0]); }
 const bads=rest.filter(x=>x.e.q==='bad'); if(bads.length&&sel.length<n){ sel.push(bads[0]); rest=rest.filter(x=>x!==bads[0]); }
 const pool=shuf(goods.concat(rest)); while(sel.length<n&&pool.length) sel.push(pool.shift());
 m.opts=shuf(sel.map(x=>x.o)); m.type=type; G.cur=m;
}
function choose(i){
 const m=G.cur, o=m.opts[i]; const e=evalOpt(o); const ph0=phase(); G.saidO=G.saidO||{}; G.saidO[T(o.t)]=1;
 const rank=x=>{ const v=evalOpt(Object.assign({},x)); return v.dr-v.dt; };
 const best=m.opts.slice().sort((a,b)=>rank(b)-rank(a))[0];
 let dt=e.dt, dr=e.dr, reply=e.rep;
 if(m.claim){ if(o.fix){ dt=-2; dr=4; } if(o.again){ dt+=8; dr-=8; } G.pend=null; }
 else { if(o.prom&&!P.savvy) G.pend={at:G.turn+2+ri(0,1),lie:0}; if(o.lie&&!P.savvy) G.pend={at:G.turn+2+ri(0,1),lie:1}; }
 if(dr>0) dr=Math.round(dr*(P.despair>=1?0.7:0.8));
 if(dr>0&&LISTEN.concat(['pres','tiempo','autor','noplazo','foco','mini']).includes(o.k)&&G.trust+dr>62){ dr=Math.max(0,62-G.trust)+Math.round(Math.max(0,G.trust+dr-62)*0.25); if(G.trust>=56) e.why.push(S2("Escuchar te subió hasta el rapport, pero para influir hacía falta algo más: lo que de verdad le movía según el expediente.","Listening got you to rapport, but influence needed more: what really moved him, according to the dossier.")); }
 G.tension=clamp(G.tension+dt,0,100); G.trust=clamp(G.trust+dr,0,100);
 G.mins+=ri(12,38); G.turn++;
 if(P.substance) G.tension=clamp(G.tension-2,0,100);
 if(G.trust>50) G.tension=clamp(G.tension-2,0,100);
 if(G.trust<15) G.tension=clamp(G.tension+2,0,100);
 const ph1=phase();
 if(!reply){ /* respuesta genérica sin repetir la misma en la partida si hay otras */ const pk=L_=>{ G.usedR=G.usedR||{}; const f=L_.filter(x=>!G.usedR[T(x)]); const r=pick(f.length?f:L_); G.usedR[T(r)]=1; return r; }; if(e.q==='good'&&o.ok) reply=o.ok; else if(e.q==='good') reply=pk(RG[ph1>=3?2:ph1>=1?1:0]); else if(e.q==='mid') reply=pk(RM); else reply=pk(RB); }
 if(o.sum&&e.q!=='bad') G.sumDone=1;
 if(o.tip) reply=S2("(Hablas aparte con la familia; la línea con {n} sigue abierta.)","(You talk to the family separately; the line to {n} stays open.)");
 const rec={turn:G.turn,mins:G.mins,type:m.type,say:fill(m.say),cmd:!!m.cmd,said:fill(o.t),k:o.k,q:e.q,dt:dt,dr:dr,why:e.why,det:!!o.det,
  best:(best!==o&&e.q!=='good')?{t:best.t,k:best.k}:null,reply:reply,events:[],rcmd:!!o.tip,tension:G.tension,trust:G.trust,ph:ph1};
 rec.saidT=o.t; rec.sayT=m.say;
 const evs=rec.events;
 if(o.tip){ const n=P.notes.filter(x=>x.key!=='subst')[0]; if(n) evs.push(S2("La familia te confirma: "+n.t[0],"The family confirms: "+n.t[1])); G.trust=clamp(G.trust+2,0,100); }
 if(o.rel&&e.q!=='bad'&&!o.rel.out&&(G.trust>=22||o.k==='qpq')){ o.rel.out=true; if(o.k==='qpq') G.qpq=1; G.ill=1; G.rel.push(o.rel.n); evs.push(S2(`${o.rel.n} sale por la puerta. Los sanitarios se hacen cargo.`,`${o.rel.n} walks out. Paramedics take over.`)); }
 if(ph1>ph0&&ph1>=2&&inside().length>1&&!G.gf){ const h=inside().filter(x=>x!==P.hc)[0]||inside()[0]; h.out=true; G.gf=1; G.rel.push(h.n); evs.push(S2(`«Voy a dejar salir a ${h.n}. Para que veas que no soy un monstruo.» ${h.n} sale sin un rasguño.`,`“I’m letting ${h.n} go. So you see I’m not a monster.” ${h.n} walks out unharmed.`)); }
 if(ph1>ph0) evs.push(S2("Subes un peldaño: "+PH[ph1][0],"You climb a step: "+PH[ph1][1]));
 if(ph1<ph0) evs.push(S2("Bajas un peldaño: "+PH[ph1][0],"You drop a step: "+PH[ph1][1]));
 G.log.push(rec);
 if(G.tension>=100) G.end='fracaso';
 else if(o.exit&&e.q==='good'&&G.tension<70){ P.host.forEach(h=>{ if(!h.out){ h.out=true; G.rel.push(h.n); } }); G.end='rendicion'; }
 else if(G.turn>=(phase()>=3&&G.tension<60?17:14)) G.end=inside().length?'tiempo':'liberados';
 return rec;
}
function score(){
 const n=Math.max(1,G.log.length), g=G.log.filter(r=>r.q==='good').length, b=G.log.filter(r=>r.q==='bad').length;
 let s=8+46*Math.max(-1,(g-1.3*b)/n);
 s+={rendicion:40,liberados:22,tiempo:4,fracaso:-6}[G.end]||0;
 s+=G.apFit*5+(G.end==='rendicion'?Math.max(0,13-n):0);
 return clamp(Math.round(s),0,100);
}
/* enfoque inicial */
const APS={emocional:[S2("Por lo personal","The personal route"),S2("Familia, afectos, lo que le importa.","Family, bonds, what matters to them.")],
 escucha:[S2("Escuchar y ganar tiempo","Listen and buy time"),S2("Dejarle hablar y bajar la tensión, sin prisa.","Let them talk and bring tension down, no rush.")],
 practico:[S2("Lo práctico","The practical route"),S2("Salidas realistas, intercambios, consecuencias claras.","Realistic exits, exchanges, clear consequences.")],
 firme:[S2("Mano dura","Hard line"),S2("Autoridad, presión y plazos.","Authority, pressure and deadlines.")]};
function apEval(ap){
 const fam=['hijos','madre','nieta','perro'].includes(P.hook);
 if(ap==='emocional'){ if(fam&&!P.inst) return [1,-6,10,S2("Encajaba: tenía un ancla afectiva real ("+({hijos:"sus hijos",madre:"su madre",nieta:"su nieta",perro:"su perro"}[P.hook])+").","It fitted: there was a real emotional anchor ("+({hijos:"the children",madre:"the mother",nieta:"the granddaughter",perro:"the dog"}[P.hook])+").")];
   if(P.estranged||P.keys.includes('sinmadre')) return [-1,10,-5,S2("No encajaba: su familia era una herida, no un ancla. El expediente lo decía.","It didn’t fit: the family was a wound, not an anchor. The dossier said so.")];
   if(P.inst) return [-1,4,-2,S2("No encajaba del todo: era un caso instrumental, más frío y práctico.","Not a great fit: an instrumental case, colder and more practical.")];
   return [0,0,2,S2("Neutral: no había un ancla afectiva clara.","Neutral: there was no clear emotional anchor.")]; }
 if(ap==='escucha'){ if(P.heard||P.despair>=1||P.impulsive>=2) return [1,-5,8,S2("Encajaba: "+(P.heard?"siente que nadie le escucha":P.despair>=1?"había señales de desesperanza":"era joven y estaba desbordado")+". Escuchar es el primer peldaño de la escalera del FBI.","It fitted: "+(P.heard?"he feels nobody listens":P.despair>=1?"there were signs of hopelessness":"young and overwhelmed")+". Listening is the first step of the FBI stairway.")];
   return [0,-2,5,S2("Siempre es una base segura: escuchar es el primer peldaño de la escalera del FBI.","Always a safe base: listening is the first step of the FBI stairway.")]; }
 if(ap==='practico'){ if(P.inst||P.savvy) return [1,-3,8,S2("Encajaba: "+(P.savvy?"conoce los procedimientos y respeta lo concreto":"era un caso instrumental: quiere algo concreto")+".","It fitted: "+(P.savvy?"he knows procedures and respects straight talk":"an instrumental case: he wants something concrete")+".")];
   if(P.heard||P.despair>=2) return [-1,3,-2,S2("No encajaba: necesitaba sentirse escuchad{o} antes de hablar de soluciones.","It didn’t fit: he needed to feel heard before talking solutions.")];
   return [0,0,3,S2("Neutral: útil más adelante, en la fase de influencia.","Neutral: useful later, in the influence stage.")]; }
 return [-1,10,-6,S2("No encajaba: la doctrina moderna (FBI desde 1990, escalera del cambio) parte de la escucha, no de la presión.","It didn’t fit: modern doctrine (FBI since 1990, the stairway) starts with listening, not pressure.")];
}
/* casos reales */
const CASES={
 norrmalmstorg:{t:S2("Atraco de Norrmalmstorg (Estocolmo, agosto de 1973)","Norrmalmstorg robbery (Stockholm, August 1973)"),
  s:S2("Jan-Erik Olsson, un preso que no había vuelto de un permiso penitenciario, atracó el banco Kreditbanken y retuvo a cuatro empleados. Durante la negociación, el ministro de Justicia permitió llevar al banco a Clark Olofsson, antiguo compañero de celda de Olsson. Al quinto día la policía usó gas lacrimógeno y los atracadores se entregaron. Es el caso que dio nombre al «síndrome de Estocolmo»: los rehenes llegaron a desconfiar más de la policía que de sus captores.","Jan-Erik Olsson, a prisoner who had not returned from prison leave, held up the Kreditbanken bank and took four employees hostage. During the negotiation the Justice Minister allowed Olsson’s former cellmate Clark Olofsson to be brought to the bank. On the fifth day police used tear gas and the robbers surrendered. It gave its name to “Stockholm syndrome”: the hostages came to distrust the police more than their captors."),
  u:"https://en.wikipedia.org/wiki/Norrmalmstorg_robbery",src:"Wikipedia, «Norrmalmstorg robbery»",tags:['banco','atraco','fugado','prision','rendicion']},
 spaghetti:{t:S2("Asedio del Spaghetti House (Londres, 28 sept.–3 oct. 1975)","Spaghetti House siege (London, 28 Sep–3 Oct 1975)"),
  s:S2("Un atraco a un restaurante de Knightsbridge salió mal y los tres atracadores se encerraron con los empleados en un almacén. La Policía Metropolitana, aconsejada por un psiquiatra forense, decidió esperar lo necesario, mantener la calma y hablar con ellos todo lo posible. A las 15 horas liberaron a un rehén como gesto de buena fe, y otro salió al ponerse enfermo. A los seis días todos los rehenes salieron ilesos; dos atracadores se entregaron y el tercero se hirió a sí mismo antes de ser detenido.","A robbery at a Knightsbridge restaurant went wrong and the three robbers shut themselves in a storeroom with the staff. The Metropolitan Police, advised by a forensic psychiatrist, chose to wait as long as needed, keep things calm and talk to them as much as possible. After 15 hours one hostage was released as a sign of good faith, and another came out after falling ill. After six days all the hostages came out unharmed; two robbers gave themselves up and the third injured himself before being arrested."),
  u:"https://en.wikipedia.org/wiki/Spaghetti_House_siege",src:"Wikipedia, «Spaghetti House siege»",tags:['tienda','atraco','buena_fe','enfermo','rendicion','tiempo']},
 gladbeck:{t:S2("Secuestro de Gladbeck (Alemania Occidental, 16–18 de agosto de 1988)","Gladbeck hostage crisis (West Germany, 16–18 August 1988)"),
  s:S2("Dos hombres con antecedentes atracaron una sucursal del Deutsche Bank en Gladbeck y huyeron con rehenes; en Bremen secuestraron un autobús. Los periodistas llegaron a entrevistarles en directo y el caso se convirtió en un circo mediático. Terminó cuando la policía embistió su coche en la autopista A3. Murieron dos rehenes y un policía en un accidente durante la persecución, y después se criticó con dureza el papel de la prensa.","Two men with criminal records robbed a Deutsche Bank branch in Gladbeck and fled with hostages; in Bremen they hijacked a bus. Journalists interviewed them live and the case became a media circus. It ended when police rammed their car on the A3 motorway. Two hostages died, as did a police officer in a crash during the chase, and the press was harshly criticised afterwards."),
  u:"https://en.wikipedia.org/wiki/Gladbeck_hostage_crisis",src:"Wikipedia, «Gladbeck hostage crisis»",tags:['banco','atraco','medios','fracaso','huida']},
 kiritsis:{t:S2("Caso Tony Kiritsis (Indianápolis, febrero de 1977)","Tony Kiritsis case (Indianapolis, February 1977)"),
  s:S2("Tony Kiritsis, de 44 años, no podía pagar el préstamo de un terreno y culpaba a su gestor hipotecario, Richard Hall, de sabotearle. Lo retuvo a punta de escopeta durante 63 horas exigiendo «justicia» y llamaba a menudo a un periodista de radio que emitía lo que decía. Liberó a Hall cuando le entregaron un documento que le prometía no ser procesado; fue detenido en el acto y declarado no culpable por enajenación mental.","Tony Kiritsis, 44, couldn’t repay a land loan and blamed his mortgage broker, Richard Hall, for sabotaging him. He held Hall at gunpoint for 63 hours demanding “justice” and often called a radio newsman who broadcast what he said. He released Hall after receiving a document promising he wouldn’t be prosecuted; he was arrested on the spot and found not guilty by reason of insanity."),
  u:"https://en.wikipedia.org/wiki/Tony_Kiritsis",src:"Wikipedia, «Tony Kiritsis»",tags:['agravio','justicia','deuda','medios','promesa']},
 bancocentral:{t:S2("Asalto al Banco Central (Barcelona, 23–24 de mayo de 1981)","Banco Central raid (Barcelona, 23–24 May 1981)"),
  s:S2("Al menos once hombres entraron en la sede del Banco Central en la plaza de Cataluña y retuvieron a unas trescientas personas durante 37 horas. Exigían la liberación de detenidos por el golpe del 23-F, aunque después se comprobó que no tenían vínculos políticos. Hubo varios intercambios de rehenes por comida y los asaltantes llegaron a negociar su entrega, pero un tirador de élite abatió a uno de ellos y entraron los GEO. Nueve asaltantes fueron detenidos.","At least eleven men entered the Banco Central headquarters on Plaça de Catalunya and held around three hundred people for 37 hours. They demanded the release of people detained over the 23-F coup attempt, though it later emerged they had no political links. There were several exchanges of hostages for food and the raiders began negotiating their surrender, but a police marksman shot one of them and the GEO went in. Nine raiders were arrested."),
  u:"https://es.wikipedia.org/wiki/Asalto_al_Banco_Central_de_Barcelona",src:"Wikipedia, «Asalto al Banco Central de Barcelona»",tags:['banco','atraco','muchos','qpq','espana']}};
const TAGTXT={banco:S2("un atraco a un banco","a bank robbery"),tienda:S2("un atraco que sale mal en un local","a robbery gone wrong in a shop or restaurant"),atraco:S2("un atraco con rehenes","a robbery with hostages"),fugado:S2("un preso que no volvió de un permiso","a prisoner who didn’t return from leave"),prision:S2("el miedo a volver a prisión","fear of going back to prison"),agravio:S2("alguien que culpa a una persona concreta de su ruina","someone blaming one person for their ruin"),justicia:S2("la exigencia de «justicia»","the demand for “justice”"),deuda:S2("las deudas","debt"),medios:S2("la presión de los medios","media pressure"),buena_fe:S2("un rehén liberado como gesto de buena fe","a hostage released as a sign of good faith"),enfermo:S2("un rehén que sale por estar enfermo","a hostage let out for being ill"),qpq:S2("intercambios (comida por personas)","exchanges (food for people)"),muchos:S2("muchas personas retenidas","many people held"),fracaso:S2("un final que se descontroló","an ending that spiralled"),rendicion:S2("un final con entrega","an ending with surrender"),promesa:S2("una promesa hecha bajo presión","a promise made under pressure"),tiempo:S2("ganar tiempo","buying time"),espana:S2("ocurrió en España","it happened in Spain"),huida:S2("la huida con rehenes","fleeing with hostages")};
function pickCase(){
 const tg=[P.sit];
 if(P.sit==='banco'||P.sit==='tienda') tg.push('atraco');
 if(P.sit==='fugado') tg.push('fugado','prision');
 if(P.prison) tg.push('prision');
 if(P.sit==='agravio') tg.push('justicia');
 if(['deudas','desahucio','seguro','paro'].includes(P.motive)) tg.push('deuda');
 if(G.media||G.dem==='medios') tg.push('medios');
 if(G.gf) tg.push('buena_fe');
 if(G.ill) tg.push('enfermo');
 if(G.qpq) tg.push('qpq');
 if(P.nh>=4) tg.push('muchos');
 if(G.end==='fracaso'||G.end==='tiempo') tg.push('fracaso');
 if(G.end==='rendicion') tg.push('rendicion');
 if(G.log.some(r=>r.k==='promesa')) tg.push('promesa');
 if(G.log.filter(r=>['tiempo','autor','noplazo','pausa'].includes(r.k)).length>=1) tg.push('tiempo');
 if(G.dem==='coche') tg.push('huida');
 let best=null, bs=-1;
 shuf(Object.keys(CASES)).forEach(k=>{ const c=CASES[k]; const sh=c.tags.filter(t=>tg.includes(t)); const s=sh.length+(c.tags.includes(P.sit)?1.5:0); if(s>bs){ bs=s; best={k:k,c:c,sh:sh}; } });
 return best;
}

/* ---------------- interfaz ---------------- */
function css(){ if(document.getElementById('ng-css')) return; const s=document.createElement('style'); s.id='ng-css';
 s.textContent=[
 '.ngw{padding-bottom:36px;max-width:860px;margin:0 auto}',
 '.nghero{position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);margin:10px 0 14px;background:#000}',
 '.nghero img{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;filter:grayscale(.35) brightness(.55)}',
 '.nghero .ht{position:absolute;left:0;right:0;bottom:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,0,.85))}',
 '.nghero .ht b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(30px,7vw,48px);letter-spacing:.02em;line-height:1.05}',
 '.nghero .ht span{color:#d6d8d2;font-size:15px}',
 '.ngsteps3{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0}',
 '@media(min-width:700px){.ngsteps3{grid-template-columns:repeat(3,1fr)}}',
 '.ngst{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px 12px;font-size:14px;color:#cfd1cd}',
 '.ngst b{display:block;color:var(--tx);font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}',
 '.ngbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:48px;padding:12px 20px;border-radius:var(--r);border:1px solid var(--ac);background:var(--ac);color:#0b0c0d;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}',
 '.ngbtn.sec{background:transparent;color:var(--tx);border-color:var(--line)}',
 '.ngbtn:disabled{opacity:.4;cursor:default}',
 '.ngrow{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}',
 '.ngfu{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);margin:16px 0;padding:0 12px}',
 '.ngfu>summary{cursor:pointer;padding:12px 0;font-weight:700;list-style:none}',
 '.ngfu>summary::-webkit-details-marker{display:none}',
 '.ngfu>summary:after{content:" ›";color:var(--mu)}',
 '.ngfu[open]>summary:after{content:" ˅"}',
 '.ngfu h4{margin:12px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ac2)}',
 '.ngfu li{margin:0 0 8px;font-size:14px;color:#cfd1cd;overflow-wrap:anywhere}',
 '.ngfu ul{padding-left:18px;margin:0 0 10px}',
 '.ngfu a{color:var(--ac2)}',
 '.ngdos{border:1px solid var(--line);border-left:4px solid #a8483c;border-radius:var(--r);background:#141618;padding:14px;margin:10px 0;position:relative}',
 '.ngdos .hd{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;color:var(--mu);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px dashed var(--line);padding-bottom:8px;margin-bottom:10px}',
 '.ngdos .hd .cf{color:#e0705f;border:1px solid #a8483c;padding:0 6px;border-radius:3px}',
 '.ngdos h3{margin:14px 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ac2)}',
 '.ngdos dl{display:grid;grid-template-columns:1fr;gap:2px 14px;margin:0}',
 '.ngdos dt{font-size:12px;color:var(--mu);margin-top:6px}',
 '.ngdos dd{margin:0;font-size:15px}',
 '@media(min-width:620px){.ngdos dl{grid-template-columns:150px 1fr}.ngdos dt{margin-top:0;padding-top:2px}.ngdos dd{margin-bottom:6px}}',
 '.ngdos .who{font-family:Anton,Impact,sans-serif;font-size:26px;letter-spacing:.02em;line-height:1.1}',
 '.ngdos ul.nt{margin:4px 0 0;padding-left:18px}.ngdos ul.nt li{margin:4px 0;font-size:15px}',
 '.ngaps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}',
 '@media(min-width:700px){.ngaps{grid-template-columns:repeat(4,1fr)}}',
 '.ngap{text-align:left;border:1px solid var(--line);border-radius:var(--r);background:var(--s2);color:var(--tx);font:inherit;padding:10px 12px;cursor:pointer;min-height:64px}',
 '.ngap b{display:block;font-size:15px}.ngap span{font-size:13px;color:var(--mu)}',
 '.ngap.on{border-color:var(--ac2);background:#262b20;box-shadow:inset 0 0 0 1px var(--ac2)}',
 '.ngscn{position:relative;margin:0 0 8px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#0e1013}',
 '.ngscn canvas{display:block;width:100%;height:150px}',
 '.ngscn.off{display:none}',
 '.ngxp[aria-pressed="false"]{color:var(--mu)}',
 '.ngty span{color:var(--mu);font-style:italic}',
 '.ngend{font-size:15px;font-weight:700}',
 '.ngmeta .ngxp+.ngxp{margin-left:-2px}',
 '.ngbar{position:sticky;top:var(--ngtop,58px);z-index:5;background:#0b0c0d;border-bottom:1px solid var(--line);padding:8px 0 8px;margin:0 0 8px}',
 '.ngm{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
 '.ngm .l{display:flex;justify-content:space-between;font-size:12px;color:var(--mu);margin-bottom:3px;gap:6px}',
 '.ngm .l b{color:var(--tx);font-weight:700}',
 '.ngm .tr{height:8px;border-radius:4px;background:#24272a;overflow:hidden}',
 '.ngm .fi{height:100%;border-radius:4px;transition:width .6s cubic-bezier(.65,.05,0,1)}',
 '.ngm .t .fi{background:linear-gradient(90deg,#d6a24e,#c8473a)}.ngm .c .fi{background:linear-gradient(90deg,#6f8b5a,#a9c47f)}',
 '.ngd{font-size:11px;font-weight:700;margin-left:4px}.ngd.up{color:#e0705f}.ngd.dn{color:#a9c47f}',
 '.ngsr{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-top:8px}',
 '.ngsr i{display:block;height:5px;border-radius:2px;background:#2a2e32}.ngsr i.on{background:var(--ac2)}',
 '.ngmeta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;font-size:12px;color:var(--mu);line-height:1.35}','.ngmeta .st{flex:1 1 auto;min-width:0}',
 '.ngmeta .ngsp{color:var(--ac2);font-weight:700}',
 '.ngxp{border:1px solid var(--line);background:transparent;color:var(--tx);border-radius:var(--r);padding:6px 10px;font:inherit;font-size:13px;cursor:pointer;min-height:36px}',
 '.nglog{display:flex;flex-direction:column;gap:8px}',
 '.ngb{max-width:88%;padding:10px 12px;border-radius:12px;font-size:15px;line-height:1.45;animation:ngin .45s cubic-bezier(.65,.05,0,1)}',
 '.ngb small{display:block;font-size:11px;color:var(--mu);margin-bottom:2px;letter-spacing:.04em;text-transform:uppercase}',
 '.ngb.s{align-self:flex-start;background:#22191a;border:1px solid #4a2b2a;border-bottom-left-radius:3px}',
 '.ngb.c{align-self:center;max-width:96%;background:#1b1f24;border:1px dashed #3a4450;font-size:14px}',
 '.ngb.y{align-self:flex-end;background:#232a1d;border:1px solid #3f4c31;border-bottom-right-radius:3px}',
 '.ngev{align-self:center;text-align:center;font-size:13px;color:var(--ac2);padding:2px 10px;animation:ngin .45s}',
 '@keyframes ngin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
 '@media(prefers-reduced-motion:reduce){.ngb,.ngev{animation:none}.ngm .fi{transition:none}}',
 '.ngopts{margin:12px 0 4px}',
 '.ngopts .q{font-size:12px;color:var(--mu);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}',
 '.ngopt{display:block;width:100%;text-align:left;padding:12px 14px;min-height:52px;border-radius:var(--r);border:1px solid var(--line);background:var(--s2);color:var(--tx);font:inherit;font-size:15px;line-height:1.4;margin:8px 0;cursor:pointer;transition:border-color .2s,background .2s}',
 '@media(hover:hover){.ngopt:hover{border-color:var(--ac2);background:#20251c}}',
 '.ngopt:disabled{opacity:.45;cursor:default}',
 '.ngov{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.72);display:flex;align-items:flex-start;justify-content:center;padding:max(12px,env(safe-area-inset-top)) 10px 10px;overflow:auto}',
 '.ngov .in{width:100%;max-width:720px}',
 '.ngres{border:1px solid var(--line);border-radius:var(--r);padding:16px;margin:10px 0;background:var(--s1)}',
 '.ngres.ok{border-color:#56703f;background:#182013}.ngres.mid{border-color:#7a6a3a;background:#1e1b12}.ngres.ko{border-color:#7b3a33;background:#1f1514}',
 '.ngres b.big{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(26px,6vw,40px);line-height:1.1;letter-spacing:.02em}',
 '.ngkp{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}',
 '@media(min-width:700px){.ngkp{grid-template-columns:repeat(4,1fr)}}',
 '.ngkp div{border:1px solid var(--line);border-radius:var(--r);padding:8px 10px;background:var(--s1)}',
 '.ngkp b{display:block;font-size:22px}.ngkp span{font-size:12px;color:var(--mu)}',
 '.ngsec{margin:22px 0 8px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--ac2)}',
 '.ngturn{border:1px solid var(--line);border-left:4px solid #555;border-radius:var(--r);padding:10px 12px;margin:8px 0;background:var(--s1)}',
 '.ngturn.good{border-left-color:#8fb26a}.ngturn.mid{border-left-color:#c9a34a}.ngturn.bad{border-left-color:#c8473a}',
 '.ngturn .h{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--mu);flex-wrap:wrap}',
 '.ngturn .q1{font-size:14px;color:#bfc2bd;margin:6px 0 2px;font-style:italic}',
 '.ngturn .q2{font-size:15px;margin:2px 0 6px}',
 '.ngtag{display:inline-block;font-size:12px;font-weight:700;padding:1px 8px;border-radius:10px;margin-right:6px}',
 '.ngtag.good{background:#2c3a20;color:#bcd796}.ngtag.mid{background:#3a321b;color:#e2c57c}.ngtag.bad{background:#3d1d1a;color:#f0998c}',
 '.ngturn p{margin:4px 0;font-size:14px;color:#cfd1cd}',
 '.ngturn .bt{font-size:14px;color:var(--ac2)}',
 '.ngcase{border:1px solid #3e4a55;border-radius:var(--r);padding:14px;background:#151a1f}',
 '.ngcase b.t{display:block;font-size:17px;margin-bottom:6px}',
 '.ngcase p{margin:6px 0;font-size:15px;color:#d0d3cf}',
 '.ngcase a{color:var(--ac2)}',
 '.ngest{font-size:11px;color:var(--mu);border:1px solid var(--line);border-radius:8px;padding:0 6px;margin-left:4px;white-space:nowrap}',
 '.ngkey li{margin:6px 0;font-size:15px}.ngkey li i{color:var(--mu);font-style:normal}'
 ].join('');
 document.head.appendChild(s);
}
const TXT=o=>esc(fill(o));
function crumbs(){ return X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Negociador','Negotiator')]]); }
function fuentesHTML(open){
 return '<details class="ngfu"'+(open?' open':'')+'><summary>'+L('Fuentes','Sources')+'</summary>'+FUENTES.map(g=>'<h4>'+esc(L(g[0],g[1]))+'</h4><ul>'+g[2].map(f=>'<li>'+esc(L(f[0],f[1]))+(f[2]?' <a href="'+esc(f[2])+'" target="_blank" rel="noopener">'+L('Enlace','Link')+' ›</a>':'')+'</li>').join('')+'</ul>').join('')+'</details>';
}
function setTop(){ try{ const t=document.querySelector('.top'); if(t) document.documentElement.style.setProperty('--ngtop',Math.max(0,Math.round(t.getBoundingClientRect().bottom))+'px'); }catch(e){} }
let TOPW=0; function watchTop(){ if(TOPW) return; TOPW=1; let q=0; const f=()=>{ if(q) return; q=1; requestAnimationFrame(()=>{ q=0; if(document.getElementById('ngBar')) setTop(); }); }; addEventListener('scroll',f,{passive:true}); addEventListener('resize',f,{passive:true}); }
function intro(){
 const h='<div class="ngw" data-noi18n>'+crumbs()+'<h1>'+L('Negociador','Negotiator')+'</h1><p class="sub">'+L('Eres el negociador. Un atraco que sale mal, alguien atrincherado, una persona que lo ha perdido todo. Antes de hablar, estudia su expediente: lo que leas decide qué funciona.','You are the negotiator. A robbery gone wrong, someone barricaded, a person who has lost everything. Before you talk, study the dossier: what you read decides what works.')+'</p>'+
  '<div class="nghero"><img src="img/juegos/negociador.webp" width="640" height="400" alt="'+esc(L('Negociadores de rehenes de la policía en un ejercicio (RAF Croughton, 2023)','Police hostage negotiators during an exercise (RAF Croughton, 2023)'))+'"><div class="ht"><b>'+L('Cada caso es distinto','Every case is different')+'</b><span>'+L('Perfil, motivo, familia y rasgos ocultos se generan al azar. Nunca se repite.','Profile, motive, family and hidden traits are random. It never repeats.')+'</span></div></div>'+
  '<div class="ngsteps3"><div class="ngst"><b>1 · '+L('Expediente','Dossier')+'</b>'+L('Edad, familia, trabajo, antecedentes, motivo y estado de ánimo. Busca su ancla y sus detonantes.','Age, family, job, record, motive and state of mind. Find their anchor and triggers.')+'</div><div class="ngst"><b>2 · '+L('Negociación','Negotiation')+'</b>'+L('En cada turno eliges entre 2 y 4 respuestas. La tensión sube o baja y vas subiendo la escalera del FBI.','Each turn you pick from 2 to 4 replies. Tension rises or falls as you climb the FBI stairway.')+'</div><div class="ngst"><b>3 · '+L('Informe','Debrief')+'</b>'+L('Qué técnica usaste en cada respuesta, qué escondía el expediente y un caso real parecido con su fuente.','Which technique each reply used, what the dossier hid and a similar real case with its source.')+'</div></div>'+
  '<div class="ngrow"><button type="button" class="ngbtn" id="ngGo">'+L('Recibir expediente ›','Get the dossier ›')+'</button></div>'+
  '<p class="sub" style="font-size:13px">'+L('Basado en doctrina publicada del FBI y la NYPD, la Policía Metropolitana de Londres, estudios del Reino Unido, Países Bajos y Australia, grupos de negociación alemanes y la red de negociadores de la Policía Nacional. Las reacciones del sujeto son una','Based on published doctrine from the FBI and NYPD, London’s Metropolitan Police, studies from the UK, the Netherlands and Australia, German negotiation groups and the Spanish National Police negotiator network. The subject’s reactions are an')+' <span class="ngest">'+L('Estimación','Estimate')+'</span></p>'+fuentesHTML(false)+'</div>';
 X.set(h,L('Negociador','Negotiator'));
 document.getElementById('ngGo').onclick=()=>startCase(null);
}

function caseNo(){ return '26-'+String(P.seed%100000).padStart(5,'0'); }
function dossierHTML(){
 const p=P; const kids=p.kids.length?p.kids.map(k=>k.n+' ('+k.age+')').join(', '):L('No tiene','None');
 const hostages=p.host.map(h=>esc(h.n)+', '+esc(T(h.role))+', '+h.age+(h.cond?' · '+esc(L((h.cond[4]==='tiene'?'con ':'')+h.cond[0],(h.cond[5]==='has'?'with ':'')+h.cond[1])):'')).join('<br>');
 const hour=String(7+(p.seed%13)).padStart(2,'0')+':'+String((p.seed>>>3)%60).padStart(2,'0');
 const sitN={banco:S2("Atraco con rehenes","Robbery with hostages"),tienda:S2("Atraco frustrado con rehenes","Failed robbery with hostages"),agravio:S2("Persona atrincherada con rehenes por un agravio","Barricaded subject with hostages over a grievance"),fugado:S2("Fugado atrincherado con rehenes","Fugitive barricaded with hostages")}[p.sit];
 return '<div class="ngdos"><div class="hd"><span>'+L('Expediente','Dossier')+' nº '+caseNo()+'</span><span class="cf">'+L('Confidencial','Confidential')+'</span></div>'+
  '<h3>'+L('Situación','Situation')+'</h3><dl><dt>'+L('Tipo','Type')+'</dt><dd>'+esc(T(sitN))+'</dd><dt>'+L('Lugar','Place')+'</dt><dd>'+esc(T(p.place))+'</dd><dt>'+L('Aviso','Call received')+'</dt><dd>'+hour+' · '+esc(T(p.corps))+'</dd><dt>'+L('Personas retenidas','People held')+'</dt><dd>'+hostages+'</dd></dl>'+
  '<h3>'+L('Sujeto','Subject')+'</h3><div class="who">'+esc(p.name+' '+p.ape)+'</div><dl>'+
  '<dt>'+L('Edad','Age')+'</dt><dd>'+p.age+'</dd><dt>'+L('Estado civil','Marital status')+'</dt><dd>'+esc(T(p.civil))+'</dd><dt>'+L('Hijos','Children')+'</dt><dd>'+esc(kids)+'</dd><dt>'+L('Vive','Lives')+'</dt><dd>'+esc(T(p.vive))+'</dd>'+
  '<dt>'+L('Trabajo','Work')+'</dt><dd>'+p.jobs.map(j=>esc(T(j))).join('; ')+'</dd><dt>'+L('Antecedentes','Record')+'</dt><dd>'+esc(T(p.record))+'</dd><dt>'+L('Salud','Health')+'</dt><dd>'+esc(T(p.health))+'</dd>'+
  '<dt>'+L('Motivo probable','Probable motive')+'</dt><dd>'+esc(T(p.motTxt))+'</dd><dt>'+L('Estado','State of mind')+'</dt><dd>'+esc(T(p.moodTxt))+'</dd></dl>'+
  (p.notes.length?'<h3>'+L('Notas de inteligencia','Intelligence notes')+'</h3><ul class="nt">'+p.notes.map(n=>'<li>'+esc(T(n.t))+'</li>').join('')+'</ul>':'')+'</div>';
}
function startCase(seed){
 FORCED=seed!=null;
 const s=seed!=null?seed:((window.crypto&&crypto.getRandomValues)?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296))>>>0;
 P=newProfile(s>>>0);
 G={ap:null,tension:P.tension0,trust:5,turn:0,mins:0,used:{},log:[],rel:[],end:null,lastType:null,pend:null,apFit:0};
 RND=rng((P.seed^0x9e3779b9)>>>0);
 const h='<div class="ngw" data-noi18n>'+crumbs()+'<h1>'+L('Expediente','Dossier')+'</h1><p class="sub">'+L('Léelo con calma: lo que hay aquí decide qué respuestas funcionan. Podrás volver a abrirlo durante la llamada.','Read it carefully: what’s here decides which replies work. You can reopen it during the call.')+'</p>'+dossierHTML()+
  '<div class="ngsec">'+L('Elige tu enfoque','Choose your approach')+'</div><div class="ngaps">'+Object.keys(APS).map(k=>'<button type="button" class="ngap" data-ap="'+k+'"><b>'+esc(T(APS[k][0]))+'</b><span>'+esc(T(APS[k][1]))+'</span></button>').join('')+'</div>'+
  '<div class="ngrow"><button type="button" class="ngbtn" id="ngCall" disabled>'+L('Llamar al sujeto ›','Call the subject ›')+'</button><button type="button" class="ngbtn sec" id="ngNew">'+L('Otro expediente','Another dossier')+'</button></div></div>';
 X.set(h,L('Negociador','Negotiator'));
 APP.querySelectorAll('.ngap').forEach(b=>b.onclick=()=>{ APP.querySelectorAll('.ngap').forEach(x=>x.classList.remove('on')); b.classList.add('on'); G.ap=b.getAttribute('data-ap'); document.getElementById('ngCall').disabled=false; });
 document.getElementById('ngCall').onclick=()=>{ if(!G.ap) return; const a=apEval(G.ap); G.apFit=a[0]; G.tension=clamp(P.tension0+a[1],0,95); G.trust=clamp(5+a[2],0,30); G.apNote=a[3]; buildTurn(); play(); };
 document.getElementById('ngNew').onclick=()=>startCase(null);
}
function barMeters(){
 const ph=phase(), ins=inside().length;
 const hrs=Math.floor(G.mins/60), mm=String(G.mins%60).padStart(2,'0');
 return '<div class="ngm"><div class="t"><div class="l"><span>'+L('Tensión','Tension')+' <span class="ngest">'+L('Estimación','Estimate')+'</span></span><span><b id="ngTv">'+G.tension+'</b><span id="ngTd"></span></span></div><div class="tr"><div class="fi" id="ngTf" style="width:'+G.tension+'%"></div></div></div>'+
  '<div class="c"><div class="l"><span>'+L('Confianza','Trust')+'</span><span><b id="ngCv">'+G.trust+'</b><span id="ngCd"></span></span></div><div class="tr"><div class="fi" id="ngCf" style="width:'+G.trust+'%"></div></div></div></div>'+
  '<div class="ngsr" id="ngSr" aria-hidden="true">'+PH.map((x,i)=>'<i class="'+(i<=ph?'on':'')+'"></i>').join('')+'</div>'+
  '<div class="ngmeta"><span class="st" id="ngSt">'+metaHTML()+'</span><button type="button" class="ngxp" id="ngSc" aria-pressed="'+(scnOff()?'false':'true')+'">'+L('Escena','Scene')+'</button><button type="button" class="ngxp" id="ngXp">'+L('Expediente','Dossier')+'</button></div>';
}
function metaHTML(){ const ph=phase(), ins=inside().length, hrs=Math.floor(G.mins/60), mm=String(G.mins%60).padStart(2,'0');
 return '<span class="ngsp">'+L('Peldaño','Step')+' '+(ph+1)+'/5 · '+esc(T(PH[ph]))+'</span><br>'+hrs+':'+mm+' h · '+L('Retenidos','Held')+' '+ins+'/'+P.host.length; }
function scnOff(){ try{ return localStorage.getItem('mat_ng_scn')==='0'; }catch(e){ return false; } }
function barHTML(){
 return '<div class="ngbar" id="ngBar"><div class="ngscn'+(scnOff()?' off':'')+'" id="ngScn"><canvas role="img" aria-label="'+esc(L('Escena de la negociación: el sujeto dentro, el negociador y la patrulla fuera','Negotiation scene: the subject inside, the negotiator and the patrol outside'))+'"></canvas></div>'+barMeters()+'</div>';
}
/* actualiza el panel en su sitio: las barras se deslizan en vez de saltar */
function barUpd(dT,dC){
 const s_=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
 s_('ngTv',G.tension); s_('ngCv',G.trust);
 const tf=document.getElementById('ngTf'), cf=document.getElementById('ngCf'); if(tf) tf.style.width=G.tension+'%'; if(cf) cf.style.width=G.trust+'%';
 const ph=phase(); const sr=document.getElementById('ngSr'); if(sr) [...sr.children].forEach((e,i)=>e.classList.toggle('on',i<=ph));
 const st=document.getElementById('ngSt'); if(st) st.innerHTML=metaHTML();
 const dd=(id,d,inv)=>{ const e=document.getElementById(id); if(!e) return; e.innerHTML=d?'<span class="ngd '+((d>0)!==inv?'up':'dn')+'">'+(d>0?'▲':'▼')+Math.abs(d)+'</span>':''; };
 dd('ngTd',dT,false); dd('ngCd',dC,true);
}
function toCur(el){ if(!el) return; const bar=document.getElementById('ngBar'); const bb=bar?Math.max(0,bar.getBoundingClientRect().bottom):0;
 const top=el.getBoundingClientRect().top+scrollY-bb-10; try{ scrollTo({top:Math.max(0,top),behavior:RM_()||window.MAT_NG_FAST?'auto':'smooth'}); }catch(e){ scrollTo(0,top); } }
function recHTML(r){
 let h='<div class="ngb '+(r.cmd?'c':'s')+'"><small>'+(r.cmd?L('Mando','Command'):esc(P.name))+'</small>'+TXT(r.sayT)+'</div>';
 h+='<div class="ngb y"><small>'+L('Tú','You')+'</small>'+TXT(r.saidT)+'</div>';
 h+='<div class="ngb '+(r.rcmd?'c':'s')+'"><small>'+(r.rcmd?L('Mando','Command'):esc(P.name))+'</small>'+TXT(r.reply)+'</div>';
 r.events.forEach(e=>{ h+='<div class="ngev">'+TXT(e)+'</div>'; });
 return h;
}
function curHTML(){
 const m=G.cur;
 return '<div class="ngb '+(m.cmd?'c':'s')+'" id="ngCur"><small>'+(m.cmd?L('Mando','Command'):esc(P.name))+'</small>'+TXT(m.say)+'</div><div class="ngopts" id="ngOpts"><div class="q">'+L('¿Qué respondes?','What do you say?')+'</div>'+m.opts.map((o,i)=>'<button type="button" class="ngopt" data-i="'+i+'">'+TXT(o.t)+'</button>').join('')+'</div>';
}
function play(){
 const h='<div class="ngw" data-noi18n>'+crumbs()+barHTML()+'<div class="nglog" id="ngLog"><div class="ngev">'+esc(L('Llamada en curso con ','Call in progress with ')+P.name+' · '+T(P.place))+'</div>'+G.log.map(recHTML).join('')+curHTML()+'</div></div>';
 X.set(h,L('Negociador','Negotiator'));
 setTop(); watchTop(); wire(); scnInit();
}
function wire(){
 const x=document.getElementById('ngXp'); if(x) x.onclick=showDossier;
 const sc=document.getElementById('ngSc'); if(sc) sc.onclick=()=>{ const w=document.getElementById('ngScn'); if(!w) return; const off=!w.classList.contains('off'); w.classList.toggle('off',off); sc.setAttribute('aria-pressed',off?'false':'true'); try{ localStorage.setItem('mat_ng_scn',off?'0':'1'); }catch(e){} if(!off&&SC.on) scnLayout(false); };
 APP.querySelectorAll('.ngopt').forEach(b=>b.onclick=()=>pickOpt(+b.getAttribute('data-i')));
}
function showDossier(){
 const ov=document.createElement('div'); ov.className='ngov'; ov.setAttribute('data-noi18n',''); ov.innerHTML='<div class="in">'+dossierHTML()+'<div class="ngrow"><button type="button" class="ngbtn" id="ngXc">'+L('Volver a la llamada','Back to the call')+'</button></div></div>';
 document.body.appendChild(ov); document.body.style.overflow='hidden';
 const close=()=>{ ov.remove(); document.body.style.overflow=''; window.removeEventListener('hashchange',close); };
 ov.querySelector('#ngXc').onclick=close; ov.onclick=e=>{ if(e.target===ov) close(); }; window.addEventListener('hashchange',close);
}
function pickOpt(i){
 if(G.busy||G.end) return; G.busy=1;
 APP.querySelectorAll('.ngopt').forEach(b=>b.disabled=true);
 const t0=G.tension, c0=G.trust, said=G.cur&&G.cur.opts[i]?G.cur.opts[i].t:null;
 const r=choose(i);
 const FAST=!!window.MAT_NG_FAST;
 const log=document.getElementById('ngLog'); const opts=document.getElementById('ngOpts'); if(opts) opts.remove(); const cur=document.getElementById('ngCur'); if(cur) cur.removeAttribute('id');
 const y=document.createElement('div'); y.className='ngb y'; y.innerHTML='<small>'+L('Tú','You')+'</small>'+TXT(r.saidT); log.appendChild(y);
 scnOnPick(said||r.saidT);
 /* «al teléfono…»: se ve que el sujeto va a contestar */
 let ty=null; if(!FAST){ ty=document.createElement('div'); ty.className='ngb '+(r.rcmd?'c':'s')+' ngty'; ty.innerHTML='<small>'+(r.rcmd?L('Mando','Command'):esc(P.name))+'</small><span>'+L('Al teléfono…','On the line…')+'</span>'; log.appendChild(ty); }
 toCur(y);
 const after=(ms,f)=>FAST?f():setTimeout(f,ms);
 after(800,()=>{
   if(ty) ty.remove();
   const rep=document.createElement('div'); rep.innerHTML='<div class="ngb '+(r.rcmd?'c':'s')+'"><small>'+(r.rcmd?L('Mando','Command'):esc(P.name))+'</small>'+TXT(r.reply)+'</div>';
   while(rep.firstChild) log.appendChild(rep.firstChild);
   barUpd(G.tension-t0,G.trust-c0);
   scnOnReply(r);
   const evs=r.events.slice(); let k=0;
   const nextEv=()=>{ if(k<evs.length){ const d=document.createElement('div'); d.className='ngev'; d.innerHTML=TXT(evs[k++]); log.appendChild(d); after(260,nextEv); return; } finish(); };
   const finish=()=>{
    if(G.end){ const end=document.createElement('div'); end.innerHTML='<div class="ngev ngend">'+esc(T(ENDS[G.end][0]))+'</div><div class="ngrow" style="justify-content:center"><button type="button" class="ngbtn" id="ngRep">'+L('Ver el informe ›','See the debrief ›')+'</button></div>'; while(end.firstChild) log.appendChild(end.firstChild); document.getElementById('ngRep').onclick=debrief; after(1400,()=>toCur(document.querySelector('.ngend'))); G.busy=0; return; }
    buildTurn();
    const c=document.createElement('div'); c.innerHTML=curHTML(); while(c.firstChild) log.appendChild(c.firstChild);
    APP.querySelectorAll('.ngopt').forEach(b=>b.onclick=()=>pickOpt(+b.getAttribute('data-i')));
    const cu=document.getElementById('ngCur'); if(cu) after(60,()=>toCur(cu));
    G.busy=0;
   };
   after(evs.length?300:420,nextEv);
 });
}
const ENDS={rendicion:[S2("Rendición pacífica","Peaceful surrender"),'ok'],liberados:[S2("Rehenes liberados","Hostages released"),'mid'],tiempo:[S2("Se agotó el tiempo","Time ran out"),'ko'],fracaso:[S2("La situación se descontroló","The situation spiralled"),'ko']};
function endText(){
 const n=P.name, hrs=Math.max(1,Math.round(G.mins/60));
 return {rendicion:S2(`${n} sale con las manos vacías y a la vista, detrás de las personas que retenía. Nadie ha resultado herido.`,`${n} walks out, hands empty and visible, behind the people being held. Nobody was hurt.`),
  liberados:S2(`Todas las personas retenidas están a salvo. ${n} sigue dentro y el relevo continúa la negociación.`,`Everyone who was held is safe. ${n} is still inside and the next shift carries on negotiating.`),
  tiempo:S2(`Tras unas ${hrs} horas sin avances suficientes, el mando decidió intervenir. El caso no se resolvió hablando.`,`After about ${hrs} hours without enough progress, command decided to intervene. The case wasn’t resolved by talking.`),
  fracaso:S2("La situación se descontroló. El mando ordenó la entrada del grupo de intervención y el caso no se resolvió hablando.","The situation spiralled. Command sent in the intervention team and the case wasn’t resolved by talking.")}[G.end];
}
function debrief(){
 const sc=score(), ng=G.log.filter(r=>r.q==='good').length, nb=G.log.filter(r=>r.q==='bad').length, ph=Math.max.apply(null,G.log.map(r=>r.ph).concat([phase()]));
 const rank=sc>=85?S2("Negociador jefe","Lead negotiator"):sc>=65?S2("Negociador","Negotiator"):sc>=45?S2("En prácticas","Trainee"):S2("Necesita formación","Needs training");
 const E=ENDS[G.end], cs=pickCase();
 const QN={good:S2("Bien","Good"),mid:S2("Regular","So-so"),bad:S2("Mal","Bad")};
 const keys=P.notes.map(n=>'<li><b>'+esc(T(n.t))+'</b><br><i>'+esc(T(n.why))+'</i></li>');
 if(P.despair>=2) keys.push('<li><b>'+esc(T(P.health))+'</b><br><i>'+L('Señales de desesperanza: la presión no funcionaba y había que preguntar directamente por el riesgo.','Signs of hopelessness: pressure wouldn’t work and you had to ask directly about the risk.')+'</i></li>');
 if(P.heard) keys.push('<li><b>'+esc(T(P.motTxt))+'</b><br><i>'+fill(S2('Un agravio: necesitaba sentirse escuchad{o} antes que cualquier solución.','A grievance: he needed to feel heard before any solution.'))+'</i></li>');
 if(P.inst&&!P.heard) keys.push('<li><b>'+esc(T(P.moodTxt))+'</b><br><i>'+L('Caso instrumental (busca algo concreto): lo práctico, los intercambios y la honestidad pesaban más que lo emocional.','Instrumental case (wants something concrete): practical moves, exchanges and honesty mattered more than emotion.')+'</i></li>');
 const turns=G.log.map(r=>{ const tc=TECH[r.k]; return '<div class="ngturn '+r.q+'"><div class="h"><span>'+L('Turno','Turn')+' '+r.turn+' · '+Math.floor(r.mins/60)+':'+String(r.mins%60).padStart(2,'0')+' h</span><span>'+L('Tensión','Tension')+' '+(r.dt>0?'+':'')+r.dt+' · '+L('Confianza','Trust')+' '+(r.dr>0?'+':'')+r.dr+'</span></div>'+
   '<div class="q1">'+(r.cmd?L('Mando','Command'):esc(P.name))+': «'+TXT(r.sayT)+'»</div><div class="q2">'+L('Tú','You')+': «'+TXT(r.saidT)+'»</div>'+
   '<p><span class="ngtag '+r.q+'">'+esc(T(QN[r.q]))+'</span><b>'+esc(T(tc[0]))+'</b> · <span style="color:var(--mu);font-size:12px">'+esc(T(SRC[tc[2]]))+'</span></p><p>'+TXT(tc[1])+'</p>'+
   r.why.map(w=>'<p>· '+TXT(w)+'</p>').join('')+(r.best?'<p class="bt">'+L('Mejor opción: ','Better option: ')+'«'+TXT(r.best.t)+'» ('+esc(T(TECH[r.best.k][0]))+')</p>':'')+'</div>'; }).join('');
 const h='<div class="ngw" data-noi18n>'+crumbs()+'<h1>'+L('Informe','Debrief')+'</h1>'+
  '<div class="ngres '+E[1]+'"><b class="big">'+esc(T(E[0]))+'</b><p>'+esc(T(endText()))+'</p></div>'+
  '<div class="ngkp"><div><b>'+sc+'</b><span>/100 · '+esc(T(rank))+'</span></div><div><b>'+Math.floor(G.mins/60)+':'+String(G.mins%60).padStart(2,'0')+'</b><span>'+L('horas de negociación','hours negotiating')+'</span></div><div><b>'+ng+' / '+nb+'</b><span>'+L('respuestas buenas / malas','good / bad replies')+'</span></div><div><b>'+(ph+1)+'/5</b><span>'+esc(T(PH[ph]))+'</span></div></div>'+
  '<div class="ngsec">'+L('Tu enfoque','Your approach')+'</div><p><b>'+esc(T(APS[G.ap][0]))+'</b>: '+TXT(G.apNote)+'</p>'+
  '<div class="ngsec">'+L('Lo que importaba del expediente','What mattered in the dossier')+'</div><ul class="ngkey">'+(keys.join('')||'<li>'+L('Un perfil sin anclas ni detonantes claros: la escucha era la única llave.','A profile with no clear anchors or triggers: listening was the only key.')+'</li>')+'</ul>'+
  '<div class="ngsec">'+L('Turno a turno','Turn by turn')+'</div>'+turns+
  (cs?'<div class="ngsec">'+L('Caso real parecido','A similar real case')+'</div><div class="ngcase"><b class="t">'+esc(T(cs.c.t))+'</b><p>'+esc(T(cs.c.s))+'</p>'+(cs.sh.length?'<p style="font-size:14px;color:var(--mu)">'+L('Se parece en: ','Similar in: ')+cs.sh.map(t=>esc(T(TAGTXT[t]))).join(', ')+'.</p>':'')+'<p style="font-size:13px">'+L('Fuente: ','Source: ')+'<a href="'+esc(cs.c.u)+'" target="_blank" rel="noopener">'+esc(cs.c.src)+' ›</a></p></div>':'')+
  '<p class="sub" style="font-size:13px;margin-top:14px">'+L('Los medidores y las reacciones del sujeto son una','The meters and the subject’s reactions are an')+' <span class="ngest">'+L('Estimación','Estimate')+'</span> '+L('de M.A.T basada en la doctrina citada. El caso real es documentado; el de la partida es inventado.','by M.A.T based on the doctrine cited. The real case is documented; the game case is invented.')+'</p>'+
  fuentesHTML(false)+
  '<div class="ngrow"><button type="button" class="ngbtn" id="ngAgain">'+L('Nuevo caso ›','New case ›')+'</button><a class="ngbtn sec" href="#/juegos">'+L('Volver a Juegos','Back to Games')+'</a></div></div>';
 X.set(h,L('Negociador','Negotiator'));
 document.getElementById('ngAgain').onclick=()=>startCase(null);
}
export function route(app,x){ APP=app; X=x; css();
 const q=(location.hash.split('?')[1]||''); const P_={}; q.split('&').forEach(kv=>{ const [k,v]=kv.split('='); if(k) P_[k]=decodeURIComponent(v||''); });
 if(P_.s&&/^\d+$/.test(P_.s)) startCase(parseInt(P_.s,10)>>>0); else intro();
}

/* ---------------- escena animada (solo dibujo: no cambia la partida ni sus números) ----------------
   Corte de la fachada: dentro, el sujeto y las personas retenidas; fuera, el negociador, la patrulla y los sanitarios.
   El sujeto reacciona a lo que pasa en la llamada: su postura, su distancia a la cristalera, su cara y su voz salen de la
   tensión y la confianza (suavizadas) y de cada respuesta tuya. Cuando la escena está tensa nadie se queda congelado:
   el sujeto vigila la puerta, la ventana o a los retenidos; la patrulla se agacha; los retenidos agachan la cabeza.
   Usa su propio generador (no toca RND), así que la partida es idéntica con o sin escena. */
const SC={on:0};
const RM_=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const lerp=(a,b,t)=>a+(b-a)*t, sstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const AR={DOWN:[0.08,0.12],PHONE:[0.8,2.85],GEST:[1.3,0.3],FIST:[0.55,1.5],CROSS:[0.3,1.85],HEAD:[2.45,2.1],UP:[2.8,0.2],NOTE:[0.55,1.35],KNEE:[0.75,0.35],LOW:[0.35,0.9]};
function scnApp(vr,o){ const SK=['#e9c4a1','#d9a982','#c48d66','#a8714c','#8a5a3c','#f0d0b4'], HR=['#2a211b','#3b2b20','#5a4030','#1d1d1f','#7a5a36','#9a8f84'];
 const TOP=['#5b6f8a','#7a4d4a','#4f6b52','#6d6a7c','#8a7a5a','#3f5a74','#7c6450','#566f6e','#8c5f72','#4d566a'], LEG=['#2c3340','#3a3a3e','#4a4236','#2f3a33','#33302e'];
 const p=x=>x[Math.floor(vr()*x.length)];
 return Object.assign({skin:p(SK),hair:p(HR),top:p(TOP),legs:p(LEG),long:vr()<0.15,hood:false,grey:false,cap:false},o||{}); }
function scnPerson(o){ const P0={hip:0.5,lean:0,tilt:0,f1:AR.DOWN[0],f2:AR.DOWN[1],b1:AR.DOWN[0],b2:AR.DOWN[1],brow:0,smile:0,phone:0};
 return Object.assign({x:0,z:1,inside:false,path:[],v:0,face:1,tface:1,ph:0,alpha:1,cur:Object.assign({},P0),tg:Object.assign({},P0),talk:null,mv:0,lastMove:0,look:0},o); }
function scnInit(){
 const wrap=document.getElementById('ngScn'); if(!wrap||!P||!G) return;
 if(SC.raf) cancelAnimationFrame(SC.raf);
 const vr=rng((P.seed^0x5bd1e995)>>>0);
 const cv=wrap.querySelector('canvas');
 Object.assign(SC,{on:1,wrap:wrap,cv:cv,ctx:cv.getContext('2d'),vr:vr,t:0,last:0,bgKey:'',ev:[],end:null,endT:0,a:G.tension/100,r:G.trust/100,
  hourV:null,blind:0,blindT:0,nextAct:2+vr()*2,act:null,hang:0,stillMax:0,stillT:0,subStillMax:0,frames:0,listen:0,glAt:0,ofcAlert:0,medOn:0,stepFx:0,ph0:null,lastAct:null,endT:0,
  pace:P.impulsive>=2?0.6:P.mood==='frio'?1.35:P.mood==='apatia'||P.mood==='triste'?1.2:1, /* cada sujeto se mueve a su ritmo */
  quirk:Math.floor(vr()*3)});
 const fem=P.fem, band=P.band;
 SC.sub=scnPerson({chair:1,inside:true,x:0,z:0.45,face:-1,tface:-1,app:scnApp(vr,{long:fem?vr()<0.8:false,grey:band==='mayor'||(band==='maduro'&&vr()<0.5),hood:band==='joven'&&vr()<0.5,cap:!fem&&band!=='mayor'&&vr()<0.2,H:1})});
 SC.sub.cur.phone=SC.sub.tg.phone=1;
 SC.hos=P.host.map((h,i)=>{ const p=scnPerson({inside:true,h:h,app:scnApp(vr,{long:h.f?vr()<0.85:false,grey:h.age>=58,H:h.age<30?0.96:1}),face:-1,tface:-1}); p.cur.hip=p.tg.hip=0.12; p.gone=!!h.out; p.alpha=h.out?0:1; return p; });
 SC.neg=scnPerson({x:0,face:1,tface:1,app:scnApp(vr,{top:'#2f3b4f',legs:'#22262e',long:/^(Laura|Ana|Beatriz|Elena)$/.test(P.yo),hair:'#2b211a'})});
 SC.neg.cur.phone=SC.neg.tg.phone=1;
 const uni=P.rural?'#3d5a3c':'#1f2e4a';
 SC.ofc=[scnPerson({face:1,tface:1,app:scnApp(vr,{top:uni,legs:uni,cap:true,uni:1})}),scnPerson({face:1,tface:1,app:scnApp(vr,{top:uni,legs:uni,cap:true,uni:1})})];
 SC.med=scnPerson({face:1,tface:1,app:scnApp(vr,{top:'#d8892a',legs:'#2b3a52',vis:1})});
 SC.layK=''; scnLayout(true);
 if(!SC.ro&&window.ResizeObserver){ SC.ro=new ResizeObserver(()=>scnLayout(false)); }
 if(SC.ro){ SC.ro.disconnect(); SC.ro.observe(wrap); }
 SC.last=performance.now(); SC.raf=requestAnimationFrame(scnFrame);
}
function scnLayout(first){
 const w=Math.max(200,Math.round(SC.wrap.clientWidth)), h=w<520?(innerHeight<720?128:150):w<760?190:220, d=Math.min(2,window.devicePixelRatio||1);
 const k=w+'x'+h+'@'+d; if(k===SC.layK) return; SC.layK=k;
 SC.cw=w; SC.ch=h; SC.dpr=d; SC.cv.width=Math.round(w*d); SC.cv.height=Math.round(h*d); SC.cv.style.height=h+'px';
 const L={}; L.gy=Math.round(h*0.86); L.bx0=Math.round(w*(w<520?0.40:0.44)); const bw=w-L.bx0;
 L.dx0=L.bx0+Math.round(bw*0.05); L.dx1=L.dx0+Math.round(Math.max(26,bw*0.15)); L.dTop=Math.round(h*0.20);
 L.wx0=L.dx1+Math.round(bw*0.04); L.wx1=w-Math.round(bw*0.035); L.wTop=Math.round(h*0.17); L.wBot=L.gy-Math.round(h*0.07);
 L.fB=L.gy-Math.round(h*0.30); L.fF=L.gy-Math.round(h*0.02); /* suelo interior: fondo y cristalera */
 L.ix0=L.dx0+4; L.ix1=L.wx1-4; L.H=h*0.56; /* altura de una persona de pie en la acera */
 L.car1=Math.round(w*(w<520?0.33:0.31)); L.car0=Math.round(L.car1-Math.max(L.H*2.15,w*0.28));
 SC.L=L; SC.bgKey='';
 const s=SC.sub, ix=f=>L.ix0+(L.ix1-L.ix0)*f;
 SC.ix=ix;
 if(first){ s.x=ix(0.62); s.z=0.45;
  const n=SC.hos.length; SC.hos.forEach((p,i)=>{ p.home=0.58+0.36*(n>1?i/(n-1):0.5); p.x=ix(p.home); p.z=0.12+0.16*((i+1)%2); });
  SC.neg.x=Math.max(w*0.12,L.car0+(L.car1-L.car0)*0.42); SC.ofc[0].x=L.car1-(L.car1-L.car0)*0.10; SC.ofc[1].x=L.car1-(L.car1-L.car0)*0.30; SC.med.x=w*0.03; SC.med.alpha=0;
 } else { SC.hos.forEach(p=>{ if(p.inside&&!p.path.length) p.x=ix(p.home); }); SC.neg.x=Math.max(w*0.12,L.car0+(L.car1-L.car0)*0.42); SC.ofc[0].x=L.car1-(L.car1-L.car0)*0.10; SC.ofc[1].x=L.car1-(L.car1-L.car0)*0.30; SC.med.x=w*0.03; }
}
/* ---- emoción visible del sujeto: estado suavizado -> postura, distancia, cara y voz ---- */
function scnVoice(){
 const a=SC.a*100, r=SC.r*100, m=P.mood; let k;
 if(SC.end==='rendicion') k=S2('Sale con las manos a la vista','Walking out, hands visible');
 else if(SC.hang>0) k=S2('Ha colgado','Has hung up');
 else if(a>=75) k=m==='panico'?S2('Fuera de sí · grita, mira a la puerta','Beside {self} · shouting, eyeing the door'):S2('Fuera de sí · grita','Beside {self} · shouting');
 else if(a>=55) k=m==='frio'?S2('Tens{o} · voz cortante','Tense · clipped voice'):m==='triste'||m==='apatia'?S2('Desbordad{o} · llora a ratos','Overwhelmed · crying at times'):S2('Alterad{o} · voz alta','Agitated · raised voice');
 else if(a>=35) k=r>=40?S2('Más calmad{o} · escucha','Calmer · listening'):m==='triste'||m==='apatia'?S2('Abatid{o} · habla muy bajo','Downcast · speaking very low'):S2('Desconfiad{o} · a la defensiva','Wary · defensive');
 else k=r>=60?S2('Tranquil{o} · habla despacio contigo','Calm · talking slowly with you'):(m==='triste'||m==='apatia')&&r<40?S2('Apagad{o} · apenas habla','Flat · barely speaking'):S2('Calmad{o} · voz baja','Settled · quiet voice');
 return fill(k).replace('{self}',P.fem?'herself':'himself');
}
function scnTargets(dt){
 const s=SC.sub, a=SC.a, r=SC.r, m=P.mood, tg=s.tg, now=SC.t, L=SC.L;
 if(SC.end==='rendicion') return;
 const ov=s.ov&&s.ov.until>now?s.ov:null;
 /* distancia: con confianza se acerca a la cristalera y a la puerta (hacia ti); con tensión se repliega junto a los retenidos */
 const close=clamp(r*1.15-a*0.45,0,1);
 const sitting=(a<0.30&&r>0.5)||((m==='triste'||m==='apatia')&&a<0.62&&r<0.6&&!SC.act);
 tg.hip=sitting?0.30:0.5;
 tg.lean=m==='ira'&&a>0.5?0.10:(m==='triste'||m==='apatia')?0.06:a<0.35?0.02:0;
 tg.tilt=(m==='triste'||m==='apatia')?0.32*(1-r)+0.05:a>0.7&&m==='panico'?-0.08:0.02;
 tg.brow=m==='ira'||m==='frio'?-0.95*a-0.1:(m==='panico'||m==='triste'||m==='apatia')?0.95*Math.max(a,0.35):-0.4*a;
 tg.brow=lerp(tg.brow,0,sstep(0.45,0.85,r)*0.7);
 tg.smile=-0.9*a+(r>0.6?0.35:0)-((m==='triste'||m==='apatia')?0.35:0);
 const B=sitting?AR.KNEE:a>0.72?(m==='panico'?AR.HEAD:m==='ira'?AR.FIST:m==='frio'?AR.CROSS:AR.LOW):m==='frio'?AR.CROSS:AR.DOWN;
 tg.b1=B[0]; tg.b2=B[1];
 const F=SC.hang>0?AR.DOWN:AR.PHONE; tg.f1=F[0]; tg.f2=F[1]; tg.phone=SC.hang>0?0.6:1;
 if(s.talk&&!SC.hang&&a>0.5&&m!=='frio'&&!sitting){ const g=m==='ira'?AR.GEST:AR.FIST; tg.b1=g[0]; tg.b2=g[1]; tg.lean+=0.05; }
 if(ov) Object.assign(tg,ov.pose);
 /* blinds: con mucha tensión baja la persiana a medias; con confianza la vuelve a subir */
 SC.blindT=a>0.62&&r<0.45?0.26:a>0.45&&r<0.3?0.14:0;
 /* hacia dónde ir */
 if(!s.path.length&&!SC.act&&!(ov&&ov.stay)){
  const bf=0.70-0.50*close+(m==='panico'?-0.05:0), bz=0.30+0.62*close;
  const tx=SC.ix(clamp(bf,0.08,0.56));
  if(Math.abs(tx-s.x)>SC.cw*0.02||Math.abs(bz-s.z)>0.06) scnGo(s,[{x:tx,z:bz,inside:true}],0.9);
 }
 /* qué mira: a la puerta/ventana (a ti) al escuchar o hablar; a los retenidos cuando la tensión sube */
 if(!s.path.length&&!(ov&&ov.face!=null)) s.tface=(s.talk||SC.listen>now||SC.hang<=0)?-1:1;
 if(ov&&ov.face!=null) s.tface=ov.face;
}
/* acciones con propósito mientras esperas tu respuesta (nunca un balanceo en bucle): solo si la escena está tensa */
function scnAct(dt){
 const s=SC.sub, a=SC.a, now=SC.t, vr=SC.vr;
 if(SC.end||s.talk||SC.listen>now) return;
 if(SC.act){ if(!s.path.length&&now>=SC.act.until){ SC.act=null; SC.nextAct=now+SC.pace*(a>0.6?2.2+vr()*2.6:5+vr()*4); } return; }
 if(a<0.34||now<SC.nextAct) return;
 if(a<0.55&&vr()<0.35){ SC.nextAct=now+SC.pace*(4+vr()*4); return; }
 const opts=['ventana','puerta','retenidos','paso'].concat(P.mood==='panico'?['puerta']:P.mood==='ira'?['paso','ventana']:P.mood==='frio'?['ventana']:['retenidos']);
 let k=opts[Math.floor(vr()*opts.length)]; if(SC.lastAct===k&&vr()<0.7) k=opts[(opts.indexOf(k)+1)%opts.length]; SC.lastAct=k;
 const ix=SC.ix;
 if(k==='ventana'){ scnGo(s,[{x:ix(0.22+vr()*0.32),z:0.93,inside:true}],1.1); SC.act={k:k,until:now+1.4+vr()*1.2}; s.ov={until:now+99,face:-1,stay:1,pose:{tilt:-0.05,lean:0.06}}; }
 else if(k==='puerta'){ scnGo(s,[{x:ix(0.05),z:0.78,inside:true}],1.2); SC.act={k:k,until:now+1.1+vr()*0.8}; s.ov={until:now+99,face:-1,stay:1,pose:{lean:0.08}}; }
 else if(k==='retenidos'){ const h=SC.hos.filter(p=>p.inside&&!p.gone); const tx=h.length?h[Math.floor(vr()*h.length)].x-SC.cw*0.06:ix(0.6); scnGo(s,[{x:tx,z:0.42,inside:true}],0.9); SC.act={k:k,until:now+1.2+vr()}; s.ov={until:now+99,face:1,stay:1,pose:{tilt:0.12}}; }
 else { scnGo(s,[{x:ix(0.12+vr()*0.46),z:0.35+vr()*0.45,inside:true}],1.0); SC.act={k:k,until:now+0.6+vr()*0.8}; s.ov={until:now+99,stay:1}; }
 SC.actEndOv=1;
}
function scnGo(p,pts,sp){ p.path=pts.slice(); p.vmax=(sp||1)*SC.L.H*0.9/(SC.pace||1); }
function scnMove(p,dt){
 if(!p.path.length){ p.v=Math.max(0,p.v-dt*SC.L.H*3); return; }
 const w=p.path[0]; const dx=w.x-p.x, dz=(w.z==null?p.z:w.z)-p.z;
 const dist=Math.abs(dx)+Math.abs(dz)*SC.L.H*0.8;
 if(dist<0.6){ p.x=w.x; if(w.z!=null) p.z=w.z; if(w.inside!=null) p.inside=w.inside; p.path.shift(); if(w.fn) w.fn(p); return; }
 const acc=SC.L.H*2.2, dec=SC.L.H*2.6, vm=p.vmax||SC.L.H*0.9;
 const vStop=Math.sqrt(2*dec*dist); p.v=Math.min(vm,vStop,p.v+acc*dt);
 const step=Math.min(dist,p.v*dt), k=step/dist;
 p.x+=dx*k; p.z+=dz*k; p.ph+=step/(SC.L.H*0.30); p.mv=SC.t;
 if(Math.abs(dx)>0.5) p.tface=dx<0?-1:1;
 if(w.inside===false&&p.inside&&p.x<=SC.L.dx1-2) p.inside=false;
}
function scnEase(p,dt){
 const c=p.cur, t=p.tg, RMv=RM_();
 for(const k in t){ const tau=k==='hip'?0.45:k==='brow'||k==='smile'?0.5:k==='phone'?0.3:0.24; const e=RMv?1:1-Math.exp(-dt/tau); const d=t[k]-c[k]; if(Math.abs(d)>0.002) p.mv=SC.t; c[k]+=d*e; }
 const df=p.tface-p.face; if(Math.abs(df)>0.01){ p.face+=Math.sign(df)*Math.min(Math.abs(df),dt*5); p.mv=SC.t; } else p.face=p.tface;
}
/* ---- eventos de la partida -> reacciones ---- */
function scnTalk(p,txt,minD){ const s=String(txt||''); p.talk={t0:SC.t,txt:s,dur:clamp(s.length/17,minD||1,3.6)}; }
function scnOnPick(said){ if(!SC.on) return; scnTalk(SC.neg,T(said),0.9); SC.listen=SC.t+1.2; SC.act=null; SC.sub.ov=null; SC.sub.path=[]; }
function scnOnReply(r){
 if(!SC.on) return; const s=SC.sub, now=SC.t, vr=SC.vr, rp=T(r.reply)||'';
 SC.act=null; SC.nextAct=now+3+vr()*2;
 const hung=/Cuelga|line goes dead/.test(rp);
 if(hung){ SC.hang=4.5; s.ov={until:now+4.5,face:1,pose:{tilt:0.2}}; scnGo(s,[{x:SC.ix(0.78),z:0.35,inside:true}],1.2); }
 else if(!r.rcmd){ scnTalk(s,rp.replace(/\(.*?\)/g,''),1.0);
  if(r.q==='bad'){ s.ov={until:now+1.8,pose:{lean:-0.12,brow:-1,smile:-1}}; scnGo(s,[{x:s.x+SC.cw*0.04*(vr()<0.5?1:-1),z:clamp(s.z-0.18,0.2,0.95),inside:true}],1.5); }
  else if(r.q==='good'){ s.ov={until:now+0.5,face:-1,pose:{tilt:0.2}}; s.ov2={at:now+0.5,until:now+0.9,pose:{tilt:-0.02}}; }
  else { s.ov={until:now+1.2,face:-1,pose:{tilt:0.1,lean:-0.03}}; }
 }
 /* la patrulla y los retenidos reaccionan a lo que oyen */
 if(r.q==='bad') SC.ofcAlert=now+3;
 /* liberaciones */
 SC.hos.forEach((p,i)=>{ if(p.h.out&&!p.gone&&!p.leaving){ scnRelease(p,i*0.8+0.6); } });
 if(r.ph>(SC.ph0==null?r.ph:SC.ph0)) SC.stepFx=now; SC.ph0=r.ph;
 if(G.end) scnEnd(G.end);
}
function scnRelease(p,delay){ p.leaving=1; const L=SC.L, at=SC.t+delay;
 SC.ev.push({at:at,fn:()=>{ p.tg.hip=0.5; p.tg.tilt=0; p.tg.b1=p.tg.f1=AR.DOWN[0]; p.tg.b2=p.tg.f2=AR.DOWN[1]; p.tg.brow=0.2; p.tg.smile=0; p.ov={until:SC.t+99};
  SC.ev.push({at:SC.t+0.7,fn:()=>{ SC.medOn=1; scnGo(p,[{x:(L.dx0+L.dx1)/2,z:0.92,inside:true},{x:L.dx0-L.H*0.15,z:1,inside:false},{x:SC.med.x+L.H*0.22,z:1,inside:false,fn:q=>{ q.gone=1; q.fade=SC.t; }}],0.9); }}); }});
}
function scnEnd(k){ SC.end=k; SC.endT=SC.t+1.2; const s=SC.sub, L=SC.L;
 if(k==='rendicion'){ const n=SC.hos.filter(p=>p.leaving&&!p.gone).length;
  SC.ev.push({at:SC.t+1.4+n*0.8,fn:()=>{ s.ov={until:SC.t+99,pose:{}}; s.tg.phone=0; s.tg.f1=AR.UP[0]; s.tg.f2=AR.UP[1]; s.tg.b1=AR.UP[0]; s.tg.b2=AR.UP[1]; s.tg.hip=0.5; s.tg.brow=0.3; s.tg.smile=-0.2; s.tg.tilt=0.12;
   scnGo(s,[{x:(L.dx0+L.dx1)/2,z:0.92,inside:true},{x:L.dx0-L.H*0.35,z:1,inside:false}],0.55);
   SC.ofc.forEach((o,i)=>SC.ev.push({at:SC.t+1.2+i*0.4,fn:()=>{ o.tg.hip=0.5; scnGo(o,[{x:L.dx0-L.H*(0.9+i*0.35),z:1}],0.6); }}));
   SC.neg.tg.phone=0; SC.neg.tg.f1=AR.DOWN[0]; SC.neg.tg.f2=AR.DOWN[1]; }});
 } else if(k==='fracaso'||k==='tiempo'){
  SC.ofc.forEach((o,i)=>SC.ev.push({at:SC.t+0.8+i*0.5,fn:()=>{ o.tg.hip=0.36; scnGo(o,[{x:L.dx0-L.H*(0.12+i*0.22),z:1}],1.3); }}));
  SC.neg.tg.phone=0;
 } else { SC.neg.tg.phone=0; }
}
/* ---- bucle ---- */
function scnFrame(ts){
 if(!SC.on||!SC.cv||!SC.cv.isConnected){ SC.on=0; if(SC.ro) SC.ro.disconnect(); return; }
 const dt=Math.min(0.05,Math.max(0,(ts-SC.last)/1000)); SC.last=ts; SC.t+=dt; SC.frames++;
 scnStep(dt); if(!SC.wrap.classList.contains('off')) scnDraw();
 SC.raf=requestAnimationFrame(scnFrame);
}
function scnStep(dt){
 const now=SC.t, e=1-Math.exp(-dt/1.1);
 SC.a+=(G.tension/100-SC.a)*e; SC.r+=(G.trust/100-SC.r)*e;
 SC.blind+=((SC.blindT||0)-SC.blind)*(1-Math.exp(-dt/0.9));
 if(SC.hang>0){ SC.hang-=dt; if(SC.hang<=0){ SC.hang=0; SC.sub.ov=null; } }
 for(let i=SC.ev.length-1;i>=0;i--){ if(now>=SC.ev[i].at){ const f=SC.ev[i].fn; SC.ev.splice(i,1); f(); } }
 const s=SC.sub;
 if(SC.act&&!s.path.length&&now>=SC.act.until){ s.ov=null; }
 scnAct(dt); scnTargets(dt);
 /* vigilancia: con tensión alta, mientras está quieto, mira a un lado y a otro (miradas sueltas, no un bucle) */
 if(SC.a>0.55&&!SC.end&&!s.path.length&&!s.talk&&!SC.hang&&now>=(SC.glAt||0)){ const vr=SC.vr; const k=Math.floor(vr()*4);
  s.ov2={at:now,until:now+0.45+vr()*0.5,pose:k===0?{tilt:-0.12}:k===1?{tilt:0.16}:k===2?{lean:0.07,tilt:0.04}:{tilt:-0.04,lean:-0.04}}; if(k===3&&!(s.ov&&s.ov.face!=null)) s.tface=-s.tface;
  SC.glAt=now+(0.8+vr()*0.7)*SC.pace; }
 if(s.ov2&&now>=s.ov2.at){ if(now<s.ov2.until) Object.assign(s.tg,s.ov2.pose); else s.ov2=null; }

 [s].concat(SC.hos,[SC.neg],SC.ofc,[SC.med]).forEach(p=>{ scnMove(p,dt); scnEase(p,dt); if(p.talk){ p.mv=now; if(now>p.talk.t0+p.talk.dur) p.talk=null; } });
 /* retenidos: cabeza baja con tensión; miran al sujeto cuando se mueve cerca o grita */
 SC.hos.forEach(p=>{ if(!p.inside||p.leaving) { if(p.fade!=null) p.alpha=Math.max(0,1-(now-p.fade)/1.2); return; }
  const near=Math.abs(s.x-p.x)<SC.cw*0.16; p.tg.tilt=SC.a>0.6&&!(near&&s.talk)?0.38:0.08; p.tface=s.x<p.x?-1:1;
  p.tg.b1=SC.a>0.6?0.9:AR.KNEE[0]; p.tg.b2=SC.a>0.6?1.6:AR.KNEE[1]; p.tg.f1=p.tg.b1; p.tg.f2=p.tg.b2; p.tg.brow=0.7*SC.a; p.tg.smile=-0.6*SC.a; });
 /* patrulla: se cubre tras el coche cuando la tensión sube; de pie cuando baja */
 if(!SC.end) SC.ofc.forEach((o,i)=>{ const crouch=SC.a>0.55||(SC.ofcAlert||0)>now; o.tg.hip=crouch?0.30+i*0.04:0.5; o.tg.lean=crouch?0.18:0.02; o.tg.f1=crouch?0.95:0.12; o.tg.f2=crouch?0.75:0.55; o.tg.b1=crouch?0.7:0.08; o.tg.b2=crouch?0.9:0.3; o.tface=1; });
 /* negociador: teléfono en la oreja; mira el expediente cuando espera; se inclina hacia la fachada al hablar */
 const n=SC.neg; if(!SC.end||SC.end==='liberados'){ n.tg.lean=n.talk?0.06:0; n.tg.tilt=n.talk?-0.02:0.14; n.tg.b1=n.talk?0.5:0.35; n.tg.b2=n.talk?0.9:1.25; n.tg.f1=AR.PHONE[0]; n.tg.f2=AR.PHONE[1]; }
 { const mt=SC.medOn&&!SC.hos.every(p=>!p.leaving||(p.gone&&p.alpha<=0.01))?1:SC.medOn&&SC.end!=='rendicion'?0:SC.medOn?1:0; SC.med.alpha+=(mt-SC.med.alpha)*(1-Math.exp(-dt/0.5)); }
 /* medida para QA: tiempo máximo sin que nada se mueva en escena con tensión alta */
 const anyMv=[s].concat(SC.hos,SC.ofc,[n]).some(p=>now-p.mv<0.05);
 if(SC.a>0.55&&!SC.end){ if(anyMv) SC.stillT=0; else { SC.stillT+=dt; SC.stillMax=Math.max(SC.stillMax,SC.stillT); } } else SC.stillT=0;
 SC.subStill=(SC.a>0.55&&!SC.end)?(now-s.mv):0; SC.subStillMax=Math.max(SC.subStillMax||0,SC.subStill);
}
function scnHour(){ const h0=7+(P.seed%13)+((P.seed>>>3)%60)/60; return h0+G.mins/60; }
function scnSky(hh){ const h=((hh%24)+24)%24; const day=sstep(6.4,8.2,h)*(1-sstep(18.2,20.6,h)); const dusk=Math.max(0,1-Math.abs(h-19.3)/1.4)*(h>16?1:0); return {day:day,dusk:dusk}; }
function scnBg(){
 const L=SC.L, w=SC.cw, h=SC.ch, d=SC.dpr; const hh=SC.hourV; const sky=scnSky(hh);
 const key=SC.layK+'|'+Math.round(hh*6); if(key===SC.bgKey&&SC.bg) return; SC.bgKey=key;
 const c=SC.bg||(SC.bg=document.createElement('canvas')); c.width=w*d; c.height=h*d; const x=c.getContext('2d'); x.setTransform(d,0,0,d,0,0);
 const day=sky.day, dusk=sky.dusk, mix=(a,b,t)=>'rgb('+[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t)).join(',')+')';
 /* cielo */
 const g=x.createLinearGradient(0,0,0,L.gy); g.addColorStop(0,mix(mix2([16,22,38],[86,128,176],day),[120,78,92],dusk*0.7)); g.addColorStop(1,mix(mix2([28,34,52],[170,190,205],day),[214,138,92],dusk*0.8));
 function mix2(a,b,t){ return [0,1,2].map(i=>a[i]+(b[i]-a[i])*t); }
 x.fillStyle=g; x.fillRect(0,0,w,L.gy);
 /* edificios del fondo */
 const vr=rng((P.seed^0x1234567)>>>0); x.fillStyle=mix([22,26,34],[118,126,136],day*0.85);
 for(let bx=-10;bx<L.bx0;){ const bw=20+vr()*40, bh=h*(0.25+vr()*0.35); if(!P.rural) x.fillRect(bx,L.gy-h*0.16-bh,bw,bh+2); bx+=bw+2; }
 if(P.rural){ x.fillStyle=mix([20,30,24],[96,124,84],day); x.beginPath(); x.moveTo(0,L.gy-h*0.14); for(let i=0;i<=8;i++) x.lineTo(L.bx0*i/8,L.gy-h*(0.16+0.06*Math.sin(i*1.7+P.seed%7))); x.lineTo(L.bx0,L.gy); x.lineTo(0,L.gy); x.fill(); }
 if(!P.rural&&day<0.6){ x.fillStyle='rgba(255,214,140,'+(0.5*(1-day))+')'; for(let i=0;i<14;i++){ const wx=vr()*L.bx0, wy=L.gy-h*0.18-vr()*h*0.4; x.fillRect(wx,wy,2,3); } }
 /* calle y acera */
 x.fillStyle=P.rural?mix([40,36,30],[124,110,88],day):mix([26,28,32],[78,82,88],day); x.fillRect(0,L.gy,w,h-L.gy);
 x.fillStyle=P.rural?mix([52,46,38],[150,134,108],day):mix([44,46,50],[136,138,140],day); x.fillRect(0,L.gy,w,Math.max(3,h*0.035));
 if(!P.rural){ x.fillStyle='rgba(230,230,220,'+(0.18+0.25*day)+')'; for(let i=0;i<w;i+=26) x.fillRect(i,h-5,13,2); }
 /* fachada */
 const fac={banco:[[52,58,66],[176,170,160]],tienda:[[60,52,46],[188,160,128]],agravio:[[44,52,62],[150,160,170]],fugado:[[58,50,44],[196,176,150]]}[P.sit];
 x.fillStyle=mix(fac[0],fac[1],0.25+0.75*day); x.fillRect(L.bx0,0,w-L.bx0,L.gy);
 x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(L.bx0,0,4,L.gy);
 if(P.rural){ x.fillStyle=mix([60,34,28],[150,82,60],day); x.beginPath(); x.moveTo(L.bx0-8,h*0.10); x.lineTo(w+4,h*0.02); x.lineTo(w+4,h*0.10); x.lineTo(L.bx0-8,h*0.14); x.fill(); }
 else if(P.sit!=='fugado'){ x.fillStyle=mix([30,34,40],[70,80,92],day); x.fillRect(L.bx0+6,h*0.035,w-L.bx0-12,h*0.075); x.fillStyle='rgba(255,255,255,'+(0.10+0.15*(1-day))+')'; x.fillRect(L.bx0+10,h*0.06,(w-L.bx0)*0.3,2); }
 if(P.sit==='tienda'){ /* toldo */ const n=Math.max(5,Math.round((L.wx1-L.dx0)/22)); for(let i=0;i<n;i++){ x.fillStyle=i%2?mix([60,30,28],[170,70,56],day):mix([70,66,60],[222,214,200],day); x.fillRect(L.dx0+(L.wx1-L.dx0)*i/n,L.wTop-h*0.07,(L.wx1-L.dx0)/n+1,h*0.06); } }
 /* interior (detrás del cristal) */
 const ig=x.createLinearGradient(0,L.wTop,0,L.wBot); const iw=P.sit==='fugado'?[[226,206,170],[150,126,100]]:P.sit==='tienda'?[[236,228,206],[168,160,140]]:[[220,216,204],[150,150,146]];
 ig.addColorStop(0,mix(iw[0],iw[1],0)); ig.addColorStop(0.62,mix(iw[0],iw[1],0.55)); ig.addColorStop(1,mix([60,56,50],[90,84,74],0.5));
 x.save(); x.beginPath(); x.rect(L.wx0,L.wTop,L.wx1-L.wx0,L.wBot-L.wTop); x.rect(L.dx0,L.dTop,L.dx1-L.dx0,L.gy-L.dTop); x.clip();
 x.fillStyle=ig; x.fillRect(L.dx0,L.wTop,L.wx1-L.dx0,L.gy-L.wTop);
 x.fillStyle='rgba(70,60,50,.35)'; x.fillRect(L.dx0,L.fB,L.wx1-L.dx0,L.gy-L.fB); /* suelo */
 x.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<6;i++) x.fillRect(L.dx0,L.fB+(L.gy-L.fB)*i/6,L.wx1-L.dx0,1);
 const ix=SC.ix, top=L.fB-h*0.22;
 x.fillStyle='rgba(40,36,32,.55)';
 if(P.sit==='banco'){ x.fillRect(ix(0.30),L.fB-h*0.15,ix(0.95)-ix(0.30),h*0.15); x.fillStyle='rgba(180,210,230,.25)'; x.fillRect(ix(0.30),L.fB-h*0.30,ix(0.95)-ix(0.30),h*0.15); x.fillStyle='rgba(30,30,30,.35)'; for(let i=0;i<4;i++) x.fillRect(ix(0.33+i*0.17),L.fB-h*0.30,2,h*0.15); }
 else if(P.sit==='tienda'){ for(let r_=0;r_<3;r_++){ x.fillStyle='rgba(60,50,40,.5)'; x.fillRect(ix(0.45),top+r_*h*0.07,ix(0.98)-ix(0.45),3); for(let i=0;i<10;i++){ x.fillStyle=['#b85c4a','#4f7aa8','#d0b040','#6b9a5b','#c08060'][(i+r_)%5]; x.fillRect(ix(0.46)+i*(ix(0.98)-ix(0.46))/10,top+r_*h*0.07-h*0.04,(ix(0.98)-ix(0.46))/12,h*0.04); } } x.fillStyle='rgba(50,40,34,.6)'; x.fillRect(ix(0.12),L.fB-h*0.13,ix(0.36)-ix(0.12),h*0.13); }
 else if(P.sit==='agravio'){ for(let i=0;i<3;i++){ const dx=ix(0.22+i*0.27); x.fillStyle='rgba(60,54,48,.6)'; x.fillRect(dx,L.fB-h*0.12,h*0.30,h*0.025); x.fillRect(dx+3,L.fB-h*0.10,2,h*0.10); x.fillRect(dx+h*0.30-5,L.fB-h*0.10,2,h*0.10); x.fillStyle='rgba(30,34,40,.75)'; x.fillRect(dx+h*0.08,L.fB-h*0.21,h*0.13,h*0.09); x.fillStyle='rgba(120,170,220,.45)'; x.fillRect(dx+h*0.09,L.fB-h*0.20,h*0.11,h*0.07); } }
 else { x.fillStyle='rgba(90,70,60,.6)'; x.fillRect(ix(0.55),L.fB-h*0.13,ix(0.92)-ix(0.55),h*0.13); x.fillRect(ix(0.55),L.fB-h*0.22,ix(0.92)-ix(0.55),h*0.06); x.fillStyle='rgba(60,50,40,.5)'; x.fillRect(ix(0.2),top-h*0.06,h*0.16,h*0.12); x.fillStyle='rgba(200,190,170,.5)'; x.fillRect(ix(0.2)+3,top-h*0.06+3,h*0.16-6,h*0.12-6); }
 /* luz interior cálida */
 const lg=x.createRadialGradient(ix(0.5),L.wTop,4,ix(0.5),L.wTop,(L.wx1-L.dx0)*0.9); lg.addColorStop(0,'rgba(255,236,190,'+(0.30+0.25*(1-day))+')'); lg.addColorStop(1,'rgba(255,236,190,0)'); x.fillStyle=lg; x.fillRect(L.dx0,L.wTop,L.wx1-L.dx0,L.gy-L.wTop);
 x.restore();
 /* marcos (el cristal y los reflejos se pintan encima de las personas) */
 /* farola */
 const px=Math.round(L.bx0-w*0.035); x.fillStyle='#2a2d31'; x.fillRect(px,h*0.12,2.5,L.gy-h*0.12); x.fillRect(px-8,h*0.12,10,2.5);
 SC.lampX=px-7; SC.lampY=h*0.12+3; SC.night=1-day; SC.dayV=day;
}
function scnPersonDraw(x,p,H,fx,fy,dark){
 const c=p.cur, A=p.app, fs=p.face<0?-1:1, wdt=Math.max(0.38,Math.abs(p.face));
 if(p.alpha<=0.01) return; x.save(); x.globalAlpha=p.alpha; x.translate(fx,fy); x.scale(wdt*fs,1);
 const hipY=-H*c.hip, moving=p.path.length&&p.v>H*0.05;
 /* sombra */
 x.fillStyle='rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(0,0,H*0.16/wdt,H*0.025,0,0,7); x.fill();
 if(p.chair&&c.hip<0.46&&c.hip>0.2){ x.fillStyle='rgba(50,42,36,.95)'; const sy=-H*(c.hip-0.03); x.fillRect(-H*0.10,sy,H*0.22,H*0.035); x.fillRect(-H*0.09,sy,H*0.025,-sy); x.fillRect(H*0.09,sy,H*0.025,-sy); x.fillRect(-H*0.11,sy-H*0.20,H*0.03,H*0.20); }
 /* piernas (IK de 2 tramos, rodilla hacia delante) */
 const lt=H*0.255, sh=c.hip<0.2;
 const legs=[[Math.sin(p.ph)*0.11,Math.max(0,Math.cos(p.ph))],[Math.sin(p.ph+Math.PI)*0.11,Math.max(0,Math.cos(p.ph+Math.PI))]];
 const col=A.legs; x.lineCap='round'; x.lineJoin='round';
 legs.forEach((l,i)=>{ let fx_=moving?l[0]*H:(i?-0.035:0.035)*H, fy_=moving?-l[1]*H*0.035:0;
  if(sh){ fx_=H*(0.30+i*0.04); fy_=0; } else if(c.hip<0.42){ fx_=H*(0.18+0.04*i); }
  const hx=0, hy=hipY, dx=fx_-hx, dy=fy_-hy, D=Math.hypot(dx,dy);
  let kx, ky; if(D>=2*lt*0.999){ kx=hx+dx/2; ky=hy+dy/2; } else { const a=Math.atan2(dy,dx), b=Math.acos(clamp(D/(2*lt),-1,1)); kx=hx+Math.cos(a-b)*lt; ky=hy+Math.sin(a-b)*lt; if(sh){ kx=hx+Math.cos(a-b)*lt; ky=hy+Math.sin(a-b)*lt; } }
  x.strokeStyle=i?shade(col,-18):col; x.lineWidth=H*0.095; x.beginPath(); x.moveTo(hx,hy); x.lineTo(kx,ky); x.lineTo(fx_,fy_); x.stroke();
  x.strokeStyle='#1b1b1d'; x.lineWidth=H*0.06; x.beginPath(); x.moveTo(fx_-H*0.005,fy_-H*0.01); x.lineTo(fx_+H*0.05,fy_-H*0.01); x.stroke(); });
 /* tronco */
 x.translate(0,hipY); x.rotate(c.lean);
 const shY=-H*0.30, arm=(a1,a2,back)=>{ const L1=H*0.19, L2=H*0.18, sx=back?-H*0.01:H*0.012, sy=shY+H*0.02;
  const ex=sx+Math.sin(a1)*L1, ey=sy+Math.cos(a1)*L1, a=a1+a2, hx=ex+Math.sin(a)*L2, hy=ey+Math.cos(a)*L2;
  x.strokeStyle=back?shade(A.top,-26):shade(A.top,8); x.lineWidth=H*0.085; x.beginPath(); x.moveTo(sx,sy); x.lineTo(ex,ey); x.lineTo(hx,hy); x.stroke();
  x.fillStyle=A.skin; x.beginPath(); x.arc(hx,hy,H*0.038,0,7); x.fill(); return [hx,hy]; };
 arm(c.b1,c.b2,1);
 const tg=x.createLinearGradient(-H*0.09,0,H*0.09,0); tg.addColorStop(0,shade(A.top,-22)); tg.addColorStop(1,shade(A.top,14));
 x.fillStyle=tg; x.beginPath(); x.moveTo(-H*0.095,H*0.01); x.lineTo(H*0.09,H*0.01); x.lineTo(H*0.11,shY+H*0.03); x.quadraticCurveTo(0,shY-H*0.03,-H*0.115,shY+H*0.03); x.closePath(); x.fill();
 if(A.vis){ x.fillStyle='rgba(235,235,210,.9)'; x.fillRect(-H*0.08,shY*0.45,H*0.16,H*0.022); }
 if(A.uni){ x.fillStyle='rgba(220,220,220,.55)'; x.fillRect(H*0.02,shY*0.75,H*0.035,H*0.02); }
 /* cabeza */
 const hr=H*0.074; x.save(); x.translate(H*0.01,shY-hr*0.95); x.rotate(c.tilt);
 scnHead(x,p,hr,A,c,1);
 x.restore();
 const hnd=arm(c.f1,c.f2,0);
 if(c.phone>0.05){ x.globalAlpha=p.alpha*clamp(c.phone,0,1); x.fillStyle='#121416'; x.save(); x.translate(hnd[0],hnd[1]); x.rotate(-0.5); x.fillRect(-H*0.015,-H*0.05,H*0.03,H*0.07); x.restore(); }
 if(dark>0){ /* luz exterior de noche: las figuras de fuera se oscurecen */ }
 x.restore();
}
function scnHead(x,p,hr,A,c,neck){
 x.fillStyle=A.skin; if(neck) x.fillRect(-hr*0.3,hr*0.5,hr*0.6,hr*0.6); x.beginPath(); x.arc(0,0,hr,0,7); x.fill();
 const hair=A.grey?'#b9b4ad':A.hair; x.fillStyle=hair;
 if(A.hood){ x.fillStyle=shade(A.top,-12); x.beginPath(); x.arc(-hr*0.15,-hr*0.05,hr*1.18,Math.PI*0.55,Math.PI*2.05); x.fill(); }
 else if(A.cap){ x.fillStyle=A.uni?'#1a2436':'#33363c'; x.beginPath(); x.arc(0,-hr*0.15,hr*1.02,Math.PI,0); x.fill(); x.fillRect(0,-hr*0.25,hr*1.5,hr*0.22); }
 else { x.beginPath(); x.arc(0,-hr*0.12,hr*1.04,Math.PI*0.92,Math.PI*1.95); x.fill(); if(A.long){ x.fillRect(-hr*1.02,-hr*0.2,hr*0.75,hr*1.7); } else x.fillRect(-hr*1.02,-hr*0.2,hr*0.6,hr*0.75); }
 if((Math.abs(p.face)>0.35||!neck)&&hr*SC.dpr>5){ /* cara: ceja, ojo, boca */
  const br=c.brow; x.strokeStyle='rgba(20,16,14,.9)'; x.lineWidth=Math.max(0.8,hr*0.16);
  x.beginPath(); x.moveTo(hr*0.18,-hr*0.32+br*hr*0.10); x.lineTo(hr*0.70,-hr*0.32-br*hr*0.14); x.stroke();
  x.fillStyle='#16110f'; x.beginPath(); x.arc(hr*0.48,-hr*0.08,Math.max(0.7,hr*0.11),0,7); x.fill();
  let mo=0; if(p.talk){ const k=Math.floor((SC.t-p.talk.t0)*14), ch=p.talk.txt.charAt(k%Math.max(1,p.talk.txt.length)).toLowerCase(); mo=/[aeoáéó]/.test(ch)?1:/[iuíú]/.test(ch)?0.6:/[a-zñ]/.test(ch)?0.3:0; }
  const sm=c.smile; x.strokeStyle='rgba(60,24,20,.95)'; x.lineWidth=Math.max(0.8,hr*0.13);
  if(mo>0.05){ x.fillStyle='#3a1714'; x.beginPath(); x.ellipse(hr*0.55,hr*0.42,hr*0.17,hr*0.07+hr*0.17*mo,0,0,7); x.fill(); }
  else { x.beginPath(); x.moveTo(hr*0.36,hr*0.42-sm*hr*0.06); x.quadraticCurveTo(hr*0.55,hr*0.42+sm*hr*0.16,hr*0.76,hr*0.40-sm*hr*0.06); x.stroke(); }
 }
}
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); const r=clamp((n>>16)+amt,0,255), g=clamp(((n>>8)&255)+amt,0,255), b=clamp((n&255)+amt,0,255); return 'rgb('+r+','+g+','+b+')'; }
function scnDraw(){
 const x=SC.ctx, L=SC.L, w=SC.cw, h=SC.ch, d=SC.dpr, now=SC.t, RMv=RM_();
 const hT=scnHour(); SC.hourV=SC.hourV==null?hT:SC.hourV+(hT-SC.hourV)*0.02; scnBg();
 x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,w,h); x.drawImage(SC.bg,0,0,w,h);
 const night=SC.night;
 /* personas dentro (por profundidad), recortadas por la puerta y la cristalera */
 const ins=[SC.sub].concat(SC.hos).filter(p=>p.inside).sort((a,b)=>a.z-b.z);
 x.save(); x.beginPath(); x.rect(L.wx0,L.wTop,L.wx1-L.wx0,L.wBot-L.wTop); x.rect(L.dx0,L.dTop,L.dx1-L.dx0,L.gy-L.dTop); x.clip();
 ins.forEach(p=>{ const fy=L.fB+(L.fF-L.fB)*p.z, H=L.H*(0.70+0.24*p.z)*(p.app.H||1); scnPersonDraw(x,p,H,p.x,fy,0); });
 /* persiana */
 if(SC.blind>0.01){ const nm_=Math.max(1,Math.round((L.wx1-L.wx0)/(h*0.75))), bx=L.wx0+(L.wx1-L.wx0)*nm_/(nm_+1), bh=(L.wBot-L.wTop)*Math.min(0.45,SC.blind*1.7); x.fillStyle='rgba(196,188,170,.94)'; x.fillRect(bx,L.wTop,L.wx1-bx,bh); x.fillStyle='rgba(90,84,74,.5)'; for(let y=L.wTop+3;y<L.wTop+bh;y+=4) x.fillRect(bx,y,L.wx1-bx,1); x.fillStyle='rgba(60,54,46,.9)'; x.fillRect(bx,L.wTop+bh-2,L.wx1-bx,2); }
 x.restore();
 /* cristal: reflejo, marcos, puerta */
 x.fillStyle='rgba(150,190,220,'+(0.10+0.06*SC.dayV)+')'; x.fillRect(L.wx0,L.wTop,L.wx1-L.wx0,L.wBot-L.wTop); x.fillRect(L.dx0,L.dTop,L.dx1-L.dx0,L.gy-L.dTop);
 x.save(); x.beginPath(); x.rect(L.wx0,L.wTop,L.wx1-L.wx0,L.wBot-L.wTop); x.clip(); x.fillStyle='rgba(255,255,255,.10)'; x.beginPath(); x.moveTo(L.wx0+w*0.05,L.wTop); x.lineTo(L.wx0+w*0.12,L.wTop); x.lineTo(L.wx0+w*0.02,L.wBot); x.lineTo(L.wx0-w*0.05,L.wBot); x.fill(); x.restore();
 x.strokeStyle='#2b2e33'; x.lineWidth=3; x.strokeRect(L.wx0,L.wTop,L.wx1-L.wx0,L.wBot-L.wTop); x.strokeRect(L.dx0,L.dTop,L.dx1-L.dx0,L.gy-L.dTop);
 x.lineWidth=2; const nm=Math.max(1,Math.round((L.wx1-L.wx0)/(h*0.75))); for(let i=1;i<=nm;i++){ const mx=L.wx0+(L.wx1-L.wx0)*i/(nm+1); x.beginPath(); x.moveTo(mx,L.wTop); x.lineTo(mx,L.wBot); x.stroke(); }
 x.fillStyle='#c9ccd0'; x.fillRect(L.dx1-6,L.dTop+(L.gy-L.dTop)*0.5,2,8);
 x.fillStyle='rgba(30,30,32,.9)'; x.fillRect(L.wx0-2,L.wBot,L.wx1-L.wx0+4,3);
 /* fuera: ambulancia y sanitario (lejos), negociador, coche, patrulla, personas que salen */
 const out=[SC.med,SC.neg].concat(SC.ofc,[SC.sub],SC.hos).filter(p=>!p.inside);
 out.filter(p=>SC.ofc.includes(p)&&p.x<L.car1+L.H*0.3).forEach(p=>scnPersonDraw(x,p,L.H*0.95,p.x,L.gy+h*0.005,night));
 /* coche patrulla genérico */
 const c0=L.car0, c1=L.car1, cy=L.gy+h*0.03, ch_=L.H*0.74;
 x.fillStyle='rgba(0,0,0,.35)'; x.beginPath(); x.ellipse((c0+c1)/2,cy,(c1-c0)*0.55,h*0.025,0,0,7); x.fill();
 x.fillStyle=P.rural?'#2f4a33':'#e8ebee'; x.beginPath(); x.moveTo(c0,cy-ch_*0.25); x.lineTo(c0+3,cy-ch_*0.62); x.lineTo(c0+(c1-c0)*0.22,cy-ch_*0.68); x.lineTo(c0+(c1-c0)*0.34,cy-ch_); x.lineTo(c0+(c1-c0)*0.74,cy-ch_); x.lineTo(c0+(c1-c0)*0.86,cy-ch_*0.66); x.lineTo(c1,cy-ch_*0.58); x.lineTo(c1,cy-ch_*0.25); x.closePath(); x.fill();
 x.fillStyle=P.rural?'#e8e0c8':'#2c4f8f'; x.fillRect(c0+1,cy-ch_*0.50,c1-c0-2,ch_*0.10);
 x.fillStyle='rgba(30,40,55,.85)'; x.beginPath(); x.moveTo(c0+(c1-c0)*0.37,cy-ch_*0.93); x.lineTo(c0+(c1-c0)*0.71,cy-ch_*0.93); x.lineTo(c0+(c1-c0)*0.80,cy-ch_*0.68); x.lineTo(c0+(c1-c0)*0.28,cy-ch_*0.68); x.fill();
 x.fillStyle='#16181b'; [0.2,0.8].forEach(f=>{ x.beginPath(); x.arc(c0+(c1-c0)*f,cy-ch_*0.22,ch_*0.20,0,7); x.fill(); }); x.fillStyle='#6b7077'; [0.2,0.8].forEach(f=>{ x.beginPath(); x.arc(c0+(c1-c0)*f,cy-ch_*0.22,ch_*0.08,0,7); x.fill(); });
 /* rotativos azules (entorno, no personaje) */
 const lb0=c0+(c1-c0)*0.42, lb1=c0+(c1-c0)*0.66, ly=cy-ch_-3; const ph=RMv?0:Math.floor(now*6)%8, on1=RMv?1:(ph===0||ph===2)?1:0.15, on2=RMv?1:(ph===4||ph===6)?1:0.15;
 x.fillStyle='rgba(60,120,255,'+(0.35+0.65*on1)+')'; x.fillRect(lb0,ly,(lb1-lb0)/2-1,3); x.fillStyle='rgba(60,120,255,'+(0.35+0.65*on2)+')'; x.fillRect(lb0+(lb1-lb0)/2+1,ly,(lb1-lb0)/2-1,3);
 const glow=(0.06+0.16*night)*Math.max(on1,on2); if(glow>0.02){ const gg=x.createRadialGradient(lb0+(on1>on2?0:(lb1-lb0)/2),ly,2,lb0,ly,w*0.55); gg.addColorStop(0,'rgba(70,130,255,'+glow+')'); gg.addColorStop(1,'rgba(70,130,255,0)'); x.fillStyle=gg; x.fillRect(0,0,w,h); }
 out.filter(p=>p===SC.med||p===SC.neg).forEach(p=>scnPersonDraw(x,p,L.H*0.97,p.x,L.gy+h*0.05,night));
 out.filter(p=>p!==SC.med&&p!==SC.neg&&!(SC.ofc.includes(p)&&p.x<L.car1+L.H*0.3)).forEach(p=>scnPersonDraw(x,p,L.H*(p.app.H||1),p.x,L.gy+h*0.035,night));
 /* farola de noche */
 if(night>0.3){ const fg=x.createRadialGradient(SC.lampX,SC.lampY,1,SC.lampX,SC.lampY+h*0.4,h*0.6); fg.addColorStop(0,'rgba(255,220,150,'+(0.35*night)+')'); fg.addColorStop(1,'rgba(255,220,150,0)'); x.fillStyle=fg; x.fillRect(0,0,w,h); x.fillStyle='rgba(255,236,190,'+night+')'; x.beginPath(); x.arc(SC.lampX,SC.lampY,2,0,7); x.fill(); }
 /* ondas de voz en el teléfono de quien habla */
 [SC.sub,SC.neg].forEach(p=>{ if(!p.talk||p.cur.phone<0.5) return; const inS=p.inside, H=inS?L.H*(0.70+0.24*p.z):L.H*0.96, fy=inS?L.fB+(L.fF-L.fB)*p.z:L.gy+h*0.02; const hx=p.x+Math.sign(p.face)*H*0.12, hy=fy-H*(p.cur.hip+0.36); const k=(now-p.talk.t0)/p.talk.dur; x.strokeStyle='rgba(255,255,255,'+(0.55*(1-k))+')'; x.lineWidth=1.2; for(let i=0;i<2;i++){ x.beginPath(); x.arc(hx,hy,4+i*4+k*4,-0.7+(p.face<0?Math.PI:0),0.7+(p.face<0?Math.PI:0)); x.stroke(); } });
 /* viñeta y tono nocturno */
 const vg=x.createLinearGradient(0,0,0,h); vg.addColorStop(0,'rgba(0,0,10,'+(0.10+0.22*night)+')'); vg.addColorStop(0.5,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.22)'); x.fillStyle=vg; x.fillRect(0,0,w,h);
 /* subida de peldaño: destello suave del marco */
 if(SC.stepFx&&now-SC.stepFx<1.2){ x.strokeStyle='rgba(169,196,127,'+(0.8*(1-(now-SC.stepFx)/1.2))+')'; x.lineWidth=3; x.strokeRect(1.5,1.5,w-3,h-3); }
 /* final */
 let cap=null;
 if(SC.end&&now>SC.endT){ const k=clamp((now-SC.endT)/2.5,0,1);
  if(SC.end==='fracaso'||SC.end==='tiempo'){ x.fillStyle='rgba(6,8,12,'+(0.6*k)+')'; x.fillRect(0,0,w,h); cap=S2('Interviene el grupo de intervención','The intervention team goes in'); }
  else if(SC.end==='rendicion'){ cap=S2('Rendición: nadie herido','Surrender: nobody hurt'); }
  else cap=S2('Todas las personas retenidas, a salvo','Everyone who was held is safe');
  cap=T(cap); x.globalAlpha=k; x.font='700 '+(w<520?13:15)+'px system-ui,sans-serif'; const tw=x.measureText(cap).width; x.fillStyle='rgba(10,12,14,.78)'; const cyy=h-15; x.fillRect((w-tw)/2-10,cyy-12,tw+20,24); x.fillStyle='#f2f2ee'; x.textBaseline='middle'; x.fillText(cap,(w-tw)/2,cyy); x.globalAlpha=1; }
 /* ficha de estado: nombre y voz */
 const vtx=scnVoice(); x.font='700 '+(w<520?11:12)+'px system-ui,sans-serif'; const nmw=x.measureText(P.name).width; x.font=(w<520?11:12)+'px system-ui,sans-serif'; const vw=x.measureText(vtx).width;
 const nar=w<520, chH=nar?40:46, pr=nar?13:15, px0=6+4+pr+2, tx0=px0+pr+8;
 const bw_=Math.max(nmw,vw)+(tx0-6)+10; x.fillStyle='rgba(8,10,12,.74)'; x.fillRect(6,6,bw_,chH);
 const ac=SC.a>0.62?'#e0705f':SC.a>0.38?'#d6a24e':'#a9c47f'; x.fillStyle=ac; x.fillRect(6,6,3,chH);
 /* retrato: la cara del sujeto en grande (ceño, boca) para leer su estado en el móvil */
 const s_=SC.sub; x.save(); x.beginPath(); x.arc(px0,6+chH/2,pr+1,0,7); x.fillStyle='rgba(255,236,190,.16)'; x.fill(); x.clip(); x.translate(px0-pr*0.12,6+chH/2+pr*0.18); x.rotate(s_.cur.tilt*0.6); scnHead(x,s_,pr*0.78,s_.app,s_.cur,0); x.restore();
 x.textBaseline='top'; x.fillStyle='#f2f2ee'; x.font='700 '+(nar?11:12)+'px system-ui,sans-serif'; x.fillText(P.name,tx0,10); x.fillStyle='#cfd1cd'; x.font=(nar?11:12)+'px system-ui,sans-serif'; x.fillText(vtx,tx0,nar?25:28);
}

/* para QA automática */
window.__SCP=()=>[SC.sub].concat(SC.hos,SC.ofc,[SC.neg,SC.med]).map(p=>({x:Math.round(p.x),z:+p.z.toFixed(2),in:p.inside,path:p.path.length,a:+p.alpha.toFixed(2),hip:+p.cur.hip.toFixed(2),f1:+p.cur.f1.toFixed(2),gone:!!p.gone,leaving:!!p.leaving})); window.__SC=SC; window.MAT_NG={scene:()=>SC.on?{a:SC.a,r:SC.r,stillMax:SC.stillMax,subStillMax:SC.subStillMax||0,frames:SC.frames,t:SC.t,act:SC.act&&SC.act.k,sub:{x:SC.sub.x,z:SC.sub.z,hip:SC.sub.cur.hip},blind:SC.blind,end:SC.end,out:SC.hos.filter(p=>!p.inside||p.gone).length,voice:scnVoice()}:null,resetStill:()=>{SC.stillMax=0;SC.subStillMax=0;},sceneStep:(sec)=>{ if(!SC.on) return 0; const n=Math.round(sec*60); for(let i=0;i<n;i++){ SC.t+=1/60; scnStep(1/60); } return SC.subStillMax; },state:()=>({P:P,G:G}),choose:i=>pickOpt(i),start:s=>startCase(s),ev:i=>evalOpt(Object.assign({},G.cur.opts[i]))};
