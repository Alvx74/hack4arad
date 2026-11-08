// The three routes as side-scrolling streets: buildings, locals and doors.
import { G, R, W, rng, shade } from './core.js';
import { dome, door, roofM, win } from './draw.js';
import { GUIDE, Hm } from './people.js';
import { PATRONS } from './patrons.js';
import { bald } from './outfit.js';

/* ---------- streets (trasee) ---------- */
const PAL=['#e6c97a','#e3a6a0','#a9cdb6','#9fb8d6','#d9a35b','#c4b0d6','#eadfc4','#b8b5ad','#e8b98a'];
function npc(name,look,lines){return{type:'npc',name,look,lines};}
const STREETS=[
{id:'t1',name:'Traseul 1',route:'Revoluției – Dragalina – Mureș',sub:'De la Biserica Roșie, pe la Primărie și Palatul Cultural, până la Ștrandul Neptun',sky:['#4f98d0','#64a9da','#7cbbe3','#98cdeb','#b7def2'],tram:true,seed:11,
 seq:[
  PATRONS.dragalina,
  npc('Ghidul Mircea',GUIDE,['Salut! Bine ai venit pe Traseul 1. Pornim de pe Bulevardul Revoluției, artera principală a Aradului.','În 1906, istoricul Nicolae Iorga a poreclit Aradul „Mica Vienă”.','La fiecare locație te așteaptă 3 întrebări. Unele răspunsuri ți le spun localnicii, pe altele le vezi cu ochii tăi: numără ușile, felinarele, statuile!','Mergi spre dreapta. Când vezi un E deasupra cuiva, apasă E. Shift te face să fugi.']),
  {f:{w:70,h:58,wall:PAL[0],floors:3}},
  npc('Contele Aradula',Hm({skin:'#e9e4f2',hair:'lins',hairC:'#111118',shirt:{c:'#f4f4f4',pat:'suit',c2:'#c0102a'},pants:{c:'#141418'},shoes:{c:'#141418'},acc:{cape:'#141418',fangs:1,lips:'#8a1030'}}),['Bună seara... adică ziua. Urăsc ziua.','Biserica Roșie e evanghelică-luterană, neogotică, ridicată în 1906 după planurile lui Szántay Lajos. E roșie de la cărămidă, nu de la ce crezi tu.','Are trei culori principale: roșul cărămizii, griul acoperișului și albul ornamentelor.','Pe lângă intrarea mare din turn, are și uși secundare pe laterale. Le-am numărat noaptea, evident.','Slujbele se țin în maghiară, așa că și inscripția de deasupra intrării e în maghiară.']),
  {land:'bisericaRosie',w:96,doors:[{dx:48,loc:'bisericaRosie'}]},
  {tree:1},
  npc('Căpitanul Barbă-de-Sarmale',Hm({skin:'#c98a5a',hair:'scurt',hairC:'#2a1d17',shirt:{c:'#f4f4f4',pat:'dungi',c2:'#c0102a'},pants:{c:'#26222b'},shoes:{c:'#1e1b22'},acc:{bandana:1,eyepatch:1,beard:'#3a2414',parrot:1}}),['Arrr! Primăria e comoara bulevardului! Palatul Administrativ a fost construit între 1872 și 1876.','Planurile au fost refăcute de arhitectul Francisc Pekar. Ține minte numele, pe barba mea!','E albă ca o pânză de corabie, cu ornamente și acoperiș gri. Turnul are 54 de metri.','Felinarele din fața intrării au globuri ca niște ciorchini. Numără-le cu ochiul ăla bun.','Pe la 1900, în curtea primăriei trăiau păuni. Papagalul meu încă e gelos.']),
  {land:'primaria',w:170,doors:[{dx:85,loc:'primaria'}]},
  {deco:'cenad',w:96},
  npc('Domnul Banană',{kind:'banana'},['Sunt banană. Nu întreba.','Filarmonica stă în Palatul Cultural, ridicat între 1911 și 1913 de arhitectul arădean Ludovic Szántay.','Arădenii îi spun clădirii pur și simplu Palatul Cultural. Conservatorul din Arad, înființat în 1833, a fost al șaselea din Europa!','De la trepte până la ușa Filarmonicii păzește o singură statuie. Am încercat să fiu a doua. M-au alungat.']),
  npc('Mimul Tăcut',{kind:'mime'},['(... mimează o cutie invizibilă ...)','Bine, vorbesc. Complexul Muzeal e tot în Palatul Cultural. Are două intrări pe care scrie MUZEU.','La intrare te întâmpină magazinul de suveniruri. Și porumbeii: e mereu cel puțin unul la ușă.','Muzeul a pornit în 1893 ca expoziție cu relicve de la 1848 și are azi peste 125.000 de piese.']),
  {land:'palatCultural',w:190,doors:[{dx:40,loc:'complexMuzeal'},{dx:95,loc:'filarmonica'},{dx:156,loc:'complexMuzeal'}]},
  {f:{w:44,h:48,wall:PAL[6],floors:2}},
  npc('Zorg din Galaxia Micălaca',{kind:'alien'},['Salutări, ființă pământeană. Clădirea albă de alături e Vechiul Cazinou, pe Bulevardul Dragalina nr. 27.','E în stil neobaroc și a fost terminată în 1872. Din 2018 e în renovare. Ca farfuria mea.','E înconjurat de un gard viu tuns perfect. Iar în față sunt felinare. Le-am numărat cu tentaculele. Încearcă și tu.']),
  npc('Tanti Veta',Hm({skin:'#f1c9a5',hair:'coc',hairC:'#c9c9d1',shirt:{c:'#5b6e9a'},pants:{c:'#7b3f8c',type:'fusta'},shoes:{c:'#3a2a20'},acc:{glasses:1,cane:1,pigeons:1}}),['Pst, puiule! Nepoata mea și-a ținut banchetul de absolvire la Cazinou.','Toți liceenii din Arad vor să-și facă banchetul acolo. Eu am dansat aici în ’68, să știi.','Și... ai mâncat ceva azi? Un erou de joc are nevoie de energie.']),
  {land:'cazinou',w:150,doors:[{dx:50,loc:'cazinou'}]},
  {f:{w:60,h:56,wall:'#7d8597',floors:3,tr:'#d9dde6'}},
  npc('Radu, elev de a XI-a',Hm({skin:'#f1c9a5',hair:'buclat',hairC:'#2a1d17',shirt:{c:'#2b2730'},pants:{c:'#3b5a8c',type:'blugi'},shoes:{c:'#f4f4f4'},acc:{backpack:'#d7263d',glasses:1}}),['Salut! Eu învăț la „Moise”, adică la Colegiul Național „Moise Nicoară”.','Clădirea a fost ridicată între 1869 și 1873, după planul arhitectului Jozsef Diescher din Pesta.','Vizavi de școală avem un teren de sport. Acolo facem ora de sport și chiulim... nu, glumesc.','Pe vremuri, liceul s-a numit „Ioan Slavici”, la fel ca terenul de vizavi. Slavici chiar a învățat aici.']),
  {land:'moise',w:200,doors:[{dx:100,loc:'moise'}]},
  npc('Om-Rață',{kind:'duck'},['Mac! Treci podul peste Mureș și ajungi la ștrand.','Mac mac. Eu intru gratis, am abonament de rață.']),
  {bridge:1,w:150},
  npc('Salvamarul Gigi',Hm({skin:'#c98a5a',hair:'scurt',hairC:'#e2c26b',shirt:{c:'#e0303f'},pants:{c:'#f5c400',type:'scurti'},shoes:{type:'slapi'},acc:{whistle:1}}),['Ștrandul Neptun e pe malul stâng al Mureșului, chiar în centrul orașului. Are 30 de hectare.','Avem tobogane colorate, numără-le de aici! Și bazine mici, cu apă caldă. E locul ideal pentru copii.','Știai că Neptun e zeul roman al mării? La greci, același zeu se numește Poseidon. Și nu alerga pe margine!']),
  {land:'neptun',w:170,doors:[{dx:35,loc:'neptun'}]}
 ]},
{id:'t2',name:'Traseul 2',route:'Centrul vechi',sub:'De la Piața Avram Iancu, pe la teatre și bibliotecă, până la Piața Reconcilierii',sky:['#3b3a7a','#6a4a8f','#b45e8a','#e88a6a','#f6c07a'],tram:true,seed:23,
 seq:[
  PATRONS.iancu,
  npc('Ghidul Mircea',GUIDE,['Bun venit pe Traseul 2, prin centrul vechi al Aradului!','Aici vei avea nevoie de ochi buni: culori, felinare, statui. Și de urechi bune pentru localnici.']),
  {f:{w:50,h:46,wall:PAL[0],floors:2,gable:1}},
  {f:{w:46,h:50,wall:PAL[1],floors:2,gable:1}},
  npc('Bunicul Ilie',Hm({skin:'#e0a878',hair:'chel',shirt:{c:'#6b4a2b'},pants:{c:'#3d3d4a'},shoes:{c:'#3a2a20'},acc:{cap:'#3d3d4a',mustache:'#d0d0d8',cane:1,pigeons:1}}),['Bună ziua! În mijlocul Pieței Avram Iancu e Statuia Soldatului Român. O salut în fiecare dimineață.','Uite ce case are piața: galbene, roz, verzi, albastre. Multicolore, ca șosetele mele.','Cel mai apropiat obiectiv de aici? Teatrul, chiar după colț.']),
  {land:'avramIancu',w:92,doors:[{dx:42,loc:'avramIancu'}]},
  {f:{w:44,h:46,wall:PAL[2],floors:2,gable:1}},
  npc('Robo-386',{kind:'robot'},()=>[bald()?'BIP. BOP. SALUT, UMAN FĂRĂ PĂR. CAPUL TĂU REFLECTĂ 98% DIN LUMINĂ.':'BIP. BOP. SALUT, UMAN.','Muzeul de Istorie a Calculatoarelor are cam 5.000 de piese. Clădirea lui e albastră.','Din drum se vede doar așa și așa, oarecum, pe după copac. Caută firma RETRO IT.','ATENȚIE: muzeul se vizitează DOAR cu programare. Eu m-am programat în 1994.']),
  {land:'muzeuCalc',w:64,doors:[{dx:50,loc:'muzeuCalc'}]},
  {f:{w:40,h:50,wall:PAL[3],floors:2}},
  npc('Bobo Clovnul',{kind:'clown'},()=>[bald()?'Ce chelie strălucitoare! Pot să-mi aranjez nasul în ea?':'Pssst! Vrei un balon în formă de teatru?','Teatrul Clasic „Ioan Slavici” a fost ridicat între 1872 și 1874. În 1957 un incendiu l-a devastat, dar a fost refăcut.','Are două săli de spectacol: sala mare și sala studio. Eu am fost dat afară din amândouă.','Biletele le cumperi chiar de la intrare. Și numără felinarele din față, eu am încercat să jonglez cu ele.']),
  {land:'teatru',w:152,doors:[{dx:64,loc:'teatru'}]},
  {tree:1},
  npc('Domnul Crap',{kind:'fish'},['Blub. Nu, nu e costum. Așa am ieșit din Mureș.','Biserica „Sf. Anton de Padova” a fost construită între 1902 și 1904 de arhitectul arădean Milan Tabacovici.','Slujbele se adresează mai ales comunității maghiare. Lângă intrare e o statuie colorată, uită-te bine la ea.','Stația de tramvai e chiar în față. Vezi șinele? Eu prefer acvariul, dar mă rog.']),
  {land:'sfAnton',w:140,doors:[{dx:70,loc:'sfAnton'}]},
  {f:{w:50,h:52,wall:PAL[5],floors:3}},
  npc('Ana, studentă',Hm({skin:'#f1c9a5',hair:'lung',hairC:'#c4552b',shirt:{c:'#f5a623'},pants:{c:'#26222b'},shoes:{c:'#f4f4f4'},acc:{backpack:'#2f86d6',glasses:1,book:1}}),['Biblioteca Județeană „A.D. Xenopol” a fost înființată în 1881 și stă acum pe strada Gheorghe Popa de Teiuș.','Accesul e complet gratuit, nu plătești nimic pe an. Eu stau aici mai mult decât acasă.','Secția pentru copii e la etajul 1. Și au inaugurat de curând un club de 3D Printing și Modeling!']),
  {land:'biblioteca',w:120,doors:[{dx:60,loc:'biblioteca'}]},
  {f:{w:56,h:46,wall:PAL[8],floors:2}},
  npc('Pinocel',{kind:'puppet'},['Salut! Sunt o marionetă de lemn. Mi-am dezlegat sforile ca să văd și eu orașul.','Teatrul de Marionete a fost fondat de la bun început ca teatru de marionete, în 1951, de Cristian Frangopol.','Actorii nu intră prin față, ci pe o ușă din lateral, ca să nu strice surpriza.','Când intri, primul lucru pe care îl vezi e o oglindă mare. Eu mă tot aranjez în ea înainte de spectacol.']),
  {land:'marionete',w:124,doors:[{dx:52,loc:'marionete'}]},
  {f:{w:50,h:48,wall:PAL[2],floors:2}},
  npc('Sir Cornel de Mureș',{kind:'knight'},['Stai! Cine trece? A, cineva în vizită. Treci.','Parcul Reconcilierii adăpostește Statuia Libertății, ridicată în 1890 în memoria celor 13 generali executați la Arad.','În jurul statuii sunt lumini mici; numără-le. Iar pe Arcul de Triumf, o singură parte e aurită. Caută la mâini.','Zona e un cartier unde trăiește de mult comunitatea maghiară. Armura? E de la muzeu. Nu spune nimănui.']),
  {land:'reconcilierii',w:180,doors:[{dx:50,loc:'reconcilierii'}]}
 ]},
{id:'t3',name:'Traseul 3',route:'Podgoria – Calea Aurel Vlaicu',sub:'Catedrala, lacul, gara, mall-urile și stadionul UTA',sky:['#4a92ca','#66a8d6','#86bde2','#acd4ec','#d4eaf4'],tram:true,seed:37,
 seq:[
  PATRONS.vlaicu,
  npc('Doamna Mioara',Hm({skin:'#f1c9a5',hair:'coc',hairC:'#6b4226',shirt:{c:'#8a5bd6'},pants:{c:'#2b2730',type:'fusta'},shoes:{c:'#d7263d'},acc:{umbrella:'#3fb36a'}}),['Bună ziua! Suntem în Podgoria. Vezi catedrala mare? E Catedrala „Sfânta Treime”.','E creștin-ortodoxă și e cea mai importantă biserică din Arad, catedrala arhiepiscopală. Prima ca importanță!','Lucrările au început în 1991 și are 58 de metri. Are chiar și adăpost antiatomic!']),
  {land:'sfTreime',w:150,doors:[{dx:25,loc:'sfTreime'}]},
  npc('Nea Fane, pescarul',Hm({skin:'#c98a5a',hair:'chel',shirt:{c:'#6b7445'},pants:{c:'#3d3d4a'},shoes:{c:'#2f6f38'},acc:{cap:'#6b7445',mustache:'#d0d0d8'}}),['Șșșt, sperii peștii. Deși, sincer, pe aici sunt mai mulți porumbei decât pești.','Bănci? Peste tot în jurul lacului. Le-am testat pe toate.','Seara se aprind luminile în jurul lacului și e frumos de tot. Legenda zice că pe fund zac sute de portofele. Eu am prins trei, goale.']),
  {land:'padurice',w:170,doors:[{dx:85,loc:'padurice'}]},
  npc('Domnul Conductor',Hm({skin:'#e0a878',hair:'scurt',hairC:'#2a1d17',shirt:{c:'#23408f'},pants:{c:'#23408f'},shoes:{c:'#111'},acc:{cap:'#23408f',capBadge:'#ffd34a',mustache:'#2a1d17',badge:1}}),['Gara din Arad a fost inaugurată pe 25 octombrie 1858. Clădirea a fost proiectată de Ferenc Pfaff.','În fața gării e expus un tren vechi, o locomotivă cu aburi. Copiii o adoră.','Înăuntru avem tonomate de cărți: pui o monedă, primești o carte. Trenuri vin zilnic. Întârzieri, tot zilnic.']),
  {land:'gara',w:180,doors:[{dx:90,loc:'gara'}]},
  npc('Rexy, în costum',{kind:'dino'},['RAAAWR! Lucrez la promoții la Atrium Mall. Vrei un fluturaș?','Mall-ul s-a deschis pe 23 martie 2010 și e deschis zilnic până la ora 22.','La ultimul etaj, cel mai mult loc îl ocupă Cinema City. Iar parcarea are 4 niveluri.','Costumul ăsta e tot din 2010. Și eu tot de atunci sunt aici. Ajutor.']),
  {land:'atrium',w:206,doors:[{dx:161,loc:'atrium'}]},
  {tree:1},
  npc('Omul cu Căruciorul',Hm({skin:'#e0a878',hair:'creasta',hairC:'#5bbf4a',shirt:{c:'#f5a623'},pants:{c:'#3d3d4a',type:'trening'},shoes:{c:'#f4f4f4'},acc:{cart:1}}),['Am intrat cu căruciorul în Atrium în 2010 și încă n-am găsit ieșirea.','La AFI Arad, deschis în 2023, găsești Decathlon pentru sport.','Cărturești și Mesopotamia sunt și aici, și în Atrium. Iar alături e ARED City, un cartier rezidențial îngrădit.']),
  {land:'afi',w:170,doors:[{dx:96,loc:'afi'}]},
  {deco:'ared',w:100},
  npc('Ionuț, suporter UTA',Hm({skin:'#f1c9a5',hair:'sapca',hairC:'#2a1d17',shirt:{c:'#d7263d',pat:'uta'},pants:{c:'#26222b'},shoes:{c:'#f4f4f4'},acc:{scarf:1}}),['Hai UTA! Aici joacă acasă UTA, „Bătrâna Doamnă” a Aradului.','Stadionul „Francisc Neuman” s-a deschis pe 28 august 2020. Are și magazin de suveniruri, mi-am luat fularul de acolo.','Iar vizavi de stadion e statuia unui fotbalist. Eu îi zic „ultimul fundaș”.']),
  {land:'stadion',w:200,doors:[{dx:100,loc:'stadion'}]},
  {deco:'fotbalist',w:44}
 ]}
];
function buildStreet(st){const objs=[],npcs=[],doors=[],lamps=[];let cx=70,lastN=-100;const r=rng(st.seed);
  for(const e of st.seq){
    if(e.type==='npc'){const nx=Math.max(cx+10,lastN+40);npcs.push({x:nx,def:e,face:-1,t:Math.floor(r()*100)});lastN=nx;cx=Math.max(cx,nx-10);continue;}
    if(e.f){objs.push({x:cx,w:e.f.w,kind:'f',o:Object.assign({},e.f)});lamps.push(cx+e.f.w+3);cx+=e.f.w+6;continue;}
    if(e.tree){objs.push({x:cx+10,kind:'tree'});cx+=24;continue;}
    if(e.bridge){objs.push({x:cx,w:e.w,kind:'bridge'});cx+=e.w;continue;}
    if(e.deco){objs.push({x:cx,w:e.w,kind:'deco',id:e.deco});cx+=e.w+6;continue;}
    if(e.land){objs.push({x:cx,w:e.w,kind:'land',id:e.land});for(const d of e.doors)doors.push({x:cx+d.dx,loc:d.loc});cx+=e.w+8;}
  }
  st.len=cx+60;st.objs=objs;st.npcs=npcs;st.doors=doors;st.lamps=lamps;
  const sk=[];let sx=-40;while(sx<st.len*0.5+W){const w=20+Math.floor(r()*30);sk.push([sx,w,18+Math.floor(r()*28),r()<0.2]);sx+=w;}st.sky2=sk;
  st.exits=[{x:24},{x:st.len-24}];st.tramX=-300;}
function palace(x,o){const w=o.w,h=o.h,wall=o.wall,tr=o.tr||'#fbf5e8',rf=o.rf||'#5a4a46';
  roofM(x,G-h-6,w,rf);
  if(o.turret){R(x+w-12,G-h-14,12,14,wall);dome(x+w-6,G-h-14,6,o.turretC||'#6fa58f');R(x+w-7,G-h-24,2,4,'#e8c547');}
  if(o.gable){const gx=x+Math.floor(w/2);R(gx-9,G-h-12,18,12,wall);R(gx-7,G-h-15,14,3,wall);R(gx-4,G-h-17,8,2,wall);R(gx-10,G-h-13,20,1,tr);R(gx-1,G-h-19,2,2,tr);win(gx-2,G-h-10,4,7,{arch:1,fr:tr});}
  R(x,G-h,w,h,wall);R(x,G-h,w,2,tr);const fl=o.floors||3,fh=Math.floor((h-6)/fl);
  for(let f=1;f<fl;f++)R(x,G-h+f*fh,w,1,tr);const n=Math.max(1,Math.floor((w-4)/11));const gap=(w-n*7)/(n+1);
  for(let f=0;f<fl;f++){const fy=G-h+f*fh+4;for(let i=0;i<n;i++){const wx=x+gap+i*(7+gap);if(f===fl-1&&i===Math.floor(n/2))door(wx-1,G-fh+1,9,fh-1,o.doorC||'#4a2e1c',1);else win(wx,fy,7,Math.min(12,fh-6),{arch:f===0,fr:tr});}}
  R(x,G-4,w,4,shade(wall,-30));}
STREETS.forEach(buildStreet);

export { PAL, STREETS, buildStreet, npc, palace };
