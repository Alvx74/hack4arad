// Interiors that open from a door: decor and the person who asks the quiz.
import { R, T, shade } from './core.js';
import { tw, txt, txtC } from './font.js';
import { lancet } from './draw.js';
import { Hm } from './people.js';
import { LOC_TOTAL } from './locations.js';

/* ---------- interiors ---------- */
const INT={
 primaria:{name:'Sala festivă a Primăriei',wall:'#eeece6',wall2:'#a3a9b2',floor:'#8a4a3a',floor2:'#7a3f31',
  decor:[['stained',60],['portrait',100],['portrait',128],['chandelier',150],['stained',190],['portrait',222],['peacock',244]],
  npc:{name:'Funcționarul de la Registratură',look:Hm({skin:'#e0a878',hair:'chel',shirt:{c:'#5d6b7a',pat:'suit',c2:'#23408f'},pants:{c:'#3d3d4a'},shoes:{c:'#111'},acc:{glasses:1,mustache:'#5d4637'}})},
  intro:['Bună ziua. Luați un bon de ordine. Glumesc, nu e nimeni la coadă.','Vitraliile pictate de arădeanul Sever Frențiu reprezintă anotimpurile. Acum, formularul... adică quiz-ul!']},
 complexMuzeal:{name:'Complexul Muzeal Arad',wall:'#d8cfc0',wall2:'#b8ad99',floor:'#9a8c76',floor2:'#8a7c66',
  decor:[['souvenir',72],['case',120],['statue',160],['case',200],['vr',236]],
  npc:{name:'Muzeograful',look:Hm({skin:'#f1c9a5',hair:'chel',shirt:{c:'#6b4a2b'},pants:{c:'#3d3d4a'},shoes:{c:'#3a2a20'},acc:{glasses:1,beard:'#c9c9d1',vest:'#8a7c66'}})},
  intro:['Bine ai venit în muzeu! Ai trecut deja pe lângă magazinul de suveniruri, nu?','Nu atinge exponatele. Mai ales pe mine. Trei întrebări!']},
 filarmonica:{name:'Sala Filarmonicii',wall:'#7a2e2e',wall2:'#5a2020',floor:'#6b4a2b',floor2:'#5a3d22',
  decor:[['organ',150],['chandelier',70],['chandelier',230],['chairs',190]],
  npc:{name:'Dirijorul',look:Hm({skin:'#f1c9a5',hair:'afro',hairC:'#e8e8f0',shirt:{c:'#141418',pat:'suit',c2:'#141418'},pants:{c:'#141418'},shoes:{c:'#141418'},acc:{bowtie:1,baton:1}})},
  intro:['Liniște în sală! Orga de aici a ajuns în Palatul Cultural cu o întârziere de vreo 100 de ani.','Un mic exercițiu de memorie, în trei timpi.']},
 cazinou:{name:'Sala de evenimente a Cazinoului',wall:'#f6f3ee',wall2:'#e6e1d8',floor:'#b08a5a',floor2:'#9c7a4e',
  decor:[['tallwin',90],['tallwin',150],['tallwin',210],['pillar',60],['pillar',120],['pillar',180],['pillar',240],['chandelier',90],['chandelier',150],['chandelier',210],['banner',150,'BANCHET 2026'],['rtable',90],['rtable',150],['rtable',210]],
  npc:{name:'Organizatoarea de evenimente',look:Hm({skin:'#f1c9a5',hair:'coc',hairC:'#2a1d17',shirt:{c:'#141418',pat:'suit',c2:'#c9a24a'},pants:{c:'#141418',type:'fusta'},shoes:{c:'#141418'},acc:{badge:1}})},
  intro:['Bine ai venit în sala de evenimente a Cazinoului: alb, coloane și candelabre.','Diseară avem banchetul unui liceu, așa că repede: trei întrebări.']},
 moise:{name:'O clasă de la „Moise Nicoară”',wall:'#cfdcc4',wall2:'#a9bb9c',floor:'#a8875a',floor2:'#96774d',
  decor:[['blackboard',100],['fieldwin',40],['fieldwin',200],['desks',160],['map',240]],
  npc:{name:'Doamna dirigintă',look:Hm({skin:'#f1c9a5',hair:'coc',hairC:'#3a2a20',shirt:{c:'#7b3f8c'},pants:{c:'#2b2730',type:'fusta'},shoes:{c:'#2b2730'},acc:{glasses:1}})},
  intro:['Ia loc! Telefoanele în ghiozdan. Avem extemporal.','Pe geam se vede terenul de sport. Nu te uita acolo, uită-te la întrebări!']},
 muzeuCalc:{name:'Muzeul de Istorie a Calculatoarelor',wall:'#f2c4bf',wall2:'#ebb9b3',floor:'#b8803f',floor2:'#9c6a30',
  decor:[['pcroom',0],['label',160,8,'VIZITE DOAR CU PROGRAMARE','#d7263d','#ffffff']],
  npc:{name:'Ghidul muzeului',look:Hm({skin:'#f1c9a5',hair:'scurt',hairC:'#6b4226',shirt:{c:'#2b2730'},acc:{glasses:1,beard:'#6b4226'}})},
  intro:['Bine ai venit! Văd că te-ai programat. Bravo, altfel nu intrai.','Avem calculatoare din toată lumea și o secțiune de calculatoare românești. Hai la quiz!']},
 teatru:{name:'Foaierul Teatrului',wall:'#5a1620',wall2:'#3e0e16',floor:'#6b3a24',floor2:'#5a2f1d',
  decor:[['ticket',72],['chandelier',110],['halldoor',140,'SALA MARE'],['halldoor',196,'SALA STUDIO'],['chandelier',230]],
  npc:{name:'Actorul principal',look:Hm({skin:'#f1c9a5',hair:'lung',hairC:'#2a1d17',shirt:{c:'#f4f4f4',pat:'suit',c2:'#141418'},pants:{c:'#141418'},shoes:{c:'#141418'},acc:{tophat:1,mustache:'#2a1d17'}})},
  intro:['A fi sau a nu fi... la quiz? Bine ai venit în teatru!','Ai luat bilet de la casă? Perfect. Trei întrebări înainte de spectacol.']},
 biblioteca:{name:'Biblioteca Județeană',wall:'#e6dcc8',wall2:'#bfae8e',floor:'#8a6b45',floor2:'#7a5d3a',
  decor:[['label',110,4,'ACCES GRATUIT','#3fb36a','#ffffff'],['stairs',74,'COPII - ETAJUL 1'],['bookshelf',128],['printer3d',180],['bookshelf',232]],
  npc:{name:'Bibliotecara',look:Hm({skin:'#f1c9a5',hair:'coc',hairC:'#c4552b',shirt:{c:'#3a6fd0'},pants:{c:'#2b2730',type:'fusta'},shoes:{c:'#2b2730'},acc:{glasses:1,book:1}})},
  intro:['Șșșt! Bine ai venit. Aici intrarea e gratuită, dar întrebările nu sunt.','Vezi imprimanta 3D? E de la cel mai nou club al nostru. Hai, trei întrebări, în liniște.']},
 marionete:{name:'Teatrul de Marionete',wall:'#4a3570',wall2:'#35254f',floor:'#6b3a24',floor2:'#5a2f1d',
  decor:[['mirrorBig',62],['booth',140],['pshelf',214]],
  npc:{name:'Păpușarul',look:Hm({skin:'#f1c9a5',hair:'buclat',hairC:'#6b4226',shirt:{c:'#d7263d',pat:'dots',c2:'#ffd34a'},pants:{c:'#2b2730'},shoes:{c:'#2b2730'},acc:{beret:1,mustache:'#6b4226'}})},
  intro:['Ai văzut oglinda de la intrare? Toată lumea se oprește la ea.','Eu am intrat pe ușa din lateral, cea a actorilor. Acum, quiz!']},
 gara:{name:'Sala de așteptare a Gării',wall:'#e3c27a',wall2:'#b8975a',floor:'#9a9488',floor2:'#86806f',
  decor:[['board',90],['vending',158],['bench',212],['clockBig',248]],
  npc:{name:'Casiera CFR',look:Hm({skin:'#f1c9a5',hair:'lung',hairC:'#2a1d17',shirt:{c:'#23408f'},pants:{c:'#23408f',type:'fusta'},shoes:{c:'#111'},acc:{cap:'#23408f',capBadge:'#ffd34a'}})},
  intro:['Bilete, vă rog! A, sunteți în vizită. Atunci întrebări, vă rog.','Ați văzut tonomatul de lângă bancă? Hai la quiz, trenul nu așteaptă.']},
 atrium:{name:'Atrium Mall',wall:'#e9eef2',wall2:'#d5dde3',floor:'#ece8e0',floor2:'#d9d3c8',
  decor:[['mall',0]],
  npc:{name:'Domnul Paznic',look:Hm({skin:'#b9784f',hair:'scurt',hairC:'#2a1d17',shirt:{c:'#2b2f36'},pants:{c:'#2b2f36'},shoes:{c:'#111'},acc:{cap:'#2b2f36',badge:1}})},
  intro:['Bună ziua. Control de rutină: trei întrebări despre mall.','Uită-te bine: programul e afișat sub balcon, iar sus, la ultimul etaj, e cinematograful.']}
};
const BADGE_TOTAL=LOC_TOTAL;

function decorDraw(d){const k=d[0],x=d[1];
  switch(k){
  case 'label':{const s=d[3],w=tw(s)+8;R(x-w/2,d[2],w,11,d[4]);txtC(s,x,d[2]+3,d[5]);break;}
  case 'poster':R(x-14,30,28,36,'#1b1424');R(x-12,32,24,32,'#2b1d40');txtC(d[2],x,36,'#39ff7a');R(x-8,46,16,12,'#c9c3b0');R(x-7,47,14,9,'#0b2a12');R(x-5,49,6,1,'#39ff7a');break;
  case 'shelf':R(x-22,30,2,102,'#6b4a2b');R(x+20,30,2,102,'#6b4a2b');for(let j=0;j<4;j++){const by=46+j*24;R(x-22,by,44,3,'#7a5a3a');if(j<3)for(let i=0;i<2;i++){const cx=x-18+i*20;R(cx,by-13,16,13,'#c9c3b0');R(cx+2,by-11,12,8,j===1?'#1b3a6a':'#0b2a12');R(cx+3,by-10,4,1,j===1?'#7fb6ff':'#39ff7a');R(cx+5,by-2,6,2,'#9a9480');}else{R(x-18,by-3,16,3,'#d8d2bf');R(x+2,by-6,16,6,'#c9c3b0');}}break;
  case 'desk':R(x-18,112,36,4,'#7a5a3a');R(x-16,116,3,16,'#6b4a2b');R(x+13,116,3,16,'#6b4a2b');R(x-10,96,20,16,'#c9c3b0');R(x-8,98,16,11,'#0b2a12');txt('>_',x-6,100,'#39ff7a');R(x-12,112,10,2,'#e8e2d0');break;
  case 'tower':R(x-6,96,12,36,'#d8d2bf');R(x-4,100,8,3,'#8a8476');R(x-4,105,8,3,'#8a8476');R(x+2,124,2,2,'#39ff7a');break;
  case 'chandelier':R(x,0,1,18,'#c9a24a');R(x-10,18,21,3,'#e8c547');for(let i=-9;i<=9;i+=4){R(x+i,21,1,4,'#e8c547');R(x+i,14,1,4,'#fff6c4');}R(x-6,24,13,2,'#e8c547');break;
  case 'stained':R(x-12,22,24,52,'#a3a9b2');lancet(x-10,24,20,48,'#2b2230');{const cs=['#e0303f','#f5c400','#3fb36a','#2f86d6'];for(let i=0;i<4;i++)R(x-8+(i%2)*8,40+Math.floor(i/2)*14,7,12,cs[i]);}R(x-1,30,2,42,'#2b2230');break;
  case 'portrait':R(x-10,36,20,26,'#c9a24a');R(x-8,38,16,22,'#4a3a2e');R(x-4,42,8,8,'#e0a878');R(x-5,41,10,3,'#3a2a20');R(x-6,50,12,10,'#2b2730');R(x-1,51,2,4,'#f4f4f4');break;
  case 'peacock':{const px=x;for(let i=0;i<7;i++){const a=(i-3)*0.35;R(px+Math.round(Math.sin(a)*14),118-Math.round(Math.cos(a)*14),3,3,'#2f86d6');R(px+Math.round(Math.sin(a)*12),120-Math.round(Math.cos(a)*12),2,2,'#3fb36a');}R(px-2,112,5,12,'#1f4fa0');R(px,104,2,9,'#1f4fa0');R(px,102,3,3,'#1f4fa0');R(px+3,103,2,1,'#f5a623');R(px,100,1,2,'#1f4fa0');R(px-1,124,1,8,'#f5a623');R(px+2,124,1,8,'#f5a623');break;}
  case 'blackboard':R(x-40,30,80,44,'#7a5a3a');R(x-38,32,76,40,'#2f4f3a');txtC('MOISE NICOARA',x,38,'#f4f1e6');txtC('1869 - 1873',x,46,'#f4f1e6');txt('2+2=4',x-30,58,'#d8e8d8');R(x+14,60,14,1,'#d8e8d8');R(x-36,72,72,2,'#a8875a');break;
  case 'fieldwin':R(x-14,30,28,40,'#f4efe4');R(x-12,32,24,36,'#8cc8e8');R(x-12,54,24,14,'#4caf50');R(x-12,54,24,1,'#f4f4f4');R(x-1,54,1,14,'#f4f4f4');R(x-8,57,2,6,'#f4f4f4');R(x+6,57,2,6,'#f4f4f4');R(x-1,32,2,22,'#f4efe4');break;
  case 'desks':for(let i=0;i<3;i++){const dx=x-50+i*40;R(dx,116,26,3,'#a8875a');R(dx+2,119,2,13,'#6b4a2b');R(dx+22,119,2,13,'#6b4a2b');R(dx+4,113,8,3,'#f4f1e6');}break;
  case 'map':R(x-16,36,32,24,'#e8dcc0');R(x-14,38,28,20,'#9fc39a');R(x-10,42,14,10,'#d9c48a');R(x+2,40,2,16,'#3a7ab8');R(x-6,46,2,2,'#e0303f');break;
  case 'mirror':R(x-12,26,24,52,'#c9a24a');R(x-10,28,20,48,'#a9c4d6');R(x-8,30,4,20,'#d9ebf6');break;
  case 'banner':R(x-30,8,60,12,'#7a1f2f');R(x-30,20,4,4,'#7a1f2f');R(x+26,20,4,4,'#7a1f2f');txtC(d[2],x,12,'#ffd34a');break;
  case 'roulette':R(x-30,108,60,6,'#2f6f45');R(x-30,106,60,2,'#5a3a24');R(x-26,114,4,18,'#5a3a24');R(x+22,114,4,18,'#5a3a24');R(x-14,100,20,6,'#5a3a24');R(x-12,98,16,4,'#d7263d');R(x-6,98,4,4,'#141418');R(x-5,99,2,2,'#ffd34a');break;
  case 'case':R(x-16,96,32,36,'#7a5a3a');R(x-14,70,28,26,'#bfe3ef');R(x-14,70,28,1,'#ffffff');R(x-8,84,8,10,'#b5652d');R(x-7,82,6,2,'#b5652d');R(x+3,86,6,8,'#c9a24a');R(x+4,84,4,2,'#c9a24a');break;
  case 'statue':R(x-12,104,24,28,'#e8e2d6');R(x-14,102,28,3,'#f4f1ec');R(x-4,66,8,10,'#bfb8aa');R(x-6,76,12,26,'#bfb8aa');R(x-10,78,4,14,'#bfb8aa');R(x+6,72,3,12,'#bfb8aa');txtC('ARADUL',x,110,'#6b6458');txtC('INTRISTAT',x,117,'#6b6458');break;
  case 'souvenir':R(x-26,104,52,28,'#8a5a2b');R(x-26,102,52,3,'#c9a24a');R(x-22,94,6,8,'#e0303f');R(x-12,96,8,6,'#2f86d6');R(x+2,92,6,10,'#f5c400');R(x+12,95,8,7,'#3fb36a');R(x-30,52,60,12,'#1b1424');txtC('SUVENIRURI',x,55,'#ffd34a');R(x-28,64,2,38,'#555');R(x+26,64,2,38,'#555');break;
  case 'vr':R(x-10,104,20,28,'#2b2f36');R(x-8,96,16,8,'#16202c');R(x-6,98,4,3,'#38e1ff');R(x+2,98,4,3,'#38e1ff');txtC('VR',x,112,'#38e1ff');break;
  case 'organ':R(x-56,16,112,70,'#5a3d22');for(let i=0;i<16;i++){const h=24+Math.round(Math.abs(Math.sin(i*0.6))*24)+((i===7||i===8)?10:0);R(x-52+i*7,74-h,5,h,'#d9c7a0');R(x-52+i*7,74-h,1,h,'#fff3d6');}R(x-56,74,112,6,'#c9a24a');R(x-40,104,80,4,'#4a2a1c');R(x-40,100,80,4,'#c9a24a');break;
  case 'chairs':for(let i=0;i<5;i++){const cx=x-40+i*18;R(cx,116,8,2,'#2b2730');R(cx,108,2,8,'#2b2730');R(cx+1,118,1,14,'#2b2730');R(cx+6,118,1,14,'#2b2730');R(cx+12,106,1,24,'#555');R(cx+9,104,7,4,'#e8e2d0');}break;
  case 'ticket':R(x-22,80,44,52,'#7a3a2a');R(x-20,86,40,22,'#e8dcc4');R(x-18,88,36,18,'#bfe3ef');R(x-4,100,8,6,'#5a2a1e');R(x-24,72,48,10,'#1b1424');txtC('CASA BILETE',x,75,'#ffd34a');R(x-22,108,44,3,'#c9a24a');break;
  case 'halldoor':R(x-16,58,32,74,'#c9a24a');R(x-14,62,28,70,'#7a1f2f');R(x-1,62,2,70,'#5a1620');R(x-5,96,2,2,'#ffd34a');R(x+3,96,2,2,'#ffd34a');R(x-22,46,44,10,'#1b1424');txtC(d[2],x,49,'#ffd34a');break;
  case 'stairs':{for(let i=0;i<10;i++)R(x-24+i*4,128-i*7,30,3,'#a8875a');for(let i=0;i<10;i++)R(x-24+i*4,131-i*7,4,1,'#6b4a2b');const w=tw(d[2])+8;R(x-w/2,18,w,11,'#f5a623');txtC(d[2],x,21,'#1b1424');break;}
  case 'bookshelf':R(x-22,30,44,102,'#6b4a2b');for(let j=0;j<5;j++){R(x-20,32+j*20,40,17,'#4a3220');const cs=['#e0303f','#2f86d6','#3fb36a','#f5c400','#8a5bd6','#f4f1ec'];for(let i=0;i<9;i++)R(x-19+i*4,36+j*20-(i%3),3,13+(i%3),cs[(i+j)%6]);}break;
  case 'printer3d':R(x-22,104,44,28,'#7a5a3a');R(x-14,74,28,30,'#2b2f36');R(x-12,76,24,26,'#9ec9e0');R(x-3,90,6,8,'#f5a623');R(x-6,82,12,2,'#555');R(x-1,84,2,6,'#ddd');{const w=tw('CLUB 3D PRINTING')+8;R(x-w/2,17,w,11,'#16202c');txtC('CLUB 3D PRINTING',x,20,'#38e1ff');R(x,28,1,46,'#555');}break;
  case 'mirrorBig':R(x-14,30,28,76,'#c9a24a');R(x-12,32,24,72,'#a9c4d6');R(x-10,34,5,30,'#d9ebf6');R(x-16,104,32,4,'#c9a24a');break;
  case 'booth':{R(x-34,56,68,6,'#7a5230');R(x-32,62,64,70,'#d7263d');for(let i=0;i<64;i+=8)R(x-32+i,62,4,70,'#f5c400');R(x-26,72,52,28,'#2a1d40');R(x-26,72,52,4,'#7a1f2f');R(x-28,100,56,4,'#7a5230');
    const bob=Math.floor(T/24)%2;R(x-15,86-bob,7,6,'#f2c79b');R(x-16,84-bob,9,2,'#c4552b');R(x-13,88-bob,1,1,'#111');R(x-10,88-bob,1,1,'#111');R(x-16,92-bob,9,8,'#3fb36a');
    R(x+7,87+bob-1,7,6,'#f8e0c0');R(x+6,85+bob-1,9,2,'#3a7bd5');R(x+9,89+bob-1,1,1,'#111');R(x+12,89+bob-1,1,1,'#111');R(x+6,93+bob-1,9,7,'#f5c400');
    R(x-30,44,60,10,'#1b1424');txtC('SPECTACOL',x,47,'#ffd34a');break;}
  case 'pshelf':{R(x-24,40,48,92,'#6b4a2b');R(x-22,42,44,88,'#4a3220');const cs=['#e0303f','#3fb36a','#2f86d6','#f5c400','#8a5bd6','#ff8fb0'];
    for(let j=0;j<3;j++){const by=66+j*26;R(x-24,by,48,3,'#8a6a42');for(let i=0;i<3;i++){const px=x-18+i*14;R(px,by-13,6,5,'#f2c79b');R(px,by-14,6,1,cs[(i+j+2)%6]);R(px+1,by-11,1,1,'#111');R(px+4,by-11,1,1,'#111');R(px-1,by-8,8,8,cs[(i+j)%6]);R(px+1,by+3,1,4,'#6b4a2b');R(px+4,by+3,1,4,'#6b4a2b');}}break;}
  case 'minstage':R(x-36,96,72,36,'#4a2a1c');R(x-40,20,10,112,'#a3172a');R(x+30,20,10,112,'#a3172a');R(x-40,20,80,10,'#a3172a');R(x-30,30,60,66,'#1b1424');break;
  case 'board':R(x-46,22,92,44,'#16202c');R(x-44,24,88,40,'#0b1222');txtC('PLECARI ZILNICE',x,27,'#ffd34a');txt('IR 14:07 BUCURESTI',x-40,37,'#7fffb0');txt('R  15:20 TIMISOARA',x-40,45,'#7fffb0');txt('R  16:45 ORADEA',x-40,53,'#7fffb0');R(x-1,66,2,4,'#2b2b33');break;
  case 'pcroom':{R(0,0,320,132,'#f2c4bf');
   for(let yy=132;yy<180;yy+=4)for(let xx=((yy>>2)%2)*4;xx<320;xx+=8){R(xx,yy,4,2,'#c48c4a');R(xx+4,yy+2,4,2,'#9c6a30');R(xx,yy+2,4,2,'#a8743a');R(xx+4,yy,4,2,'#b8803f');}
   R(0,0,320,5,'#fbf6ee');R(0,5,320,1,'#c9a24a');R(0,6,320,2,'#b8b07a');
   R(42,24,28,104,'#f4f1ec');R(45,27,22,98,'#cfe2ee');R(55,27,2,98,'#f4f1ec');R(45,72,22,2,'#f4f1ec');
   for(const [px,c2] of[[100,'#7fb6e6'],[148,'#9fc39a'],[196,'#bcd6e6']]){R(px,22,22,24,'#1b2a4a');R(px+2,24,18,12,c2);R(px+3,38,16,2,'#e8edf2');R(px+3,41,12,1,'#e8edf2');}
   R(232,20,32,32,'#1b2a4a');R(234,22,28,22,'#5a8fb5');R(236,46,24,3,'#e8edf2');
   const its=['#e8e2d0','#2b2b33','#d8d2bf','#1f2a24','#c9c3b0','#3a3a42'];
   for(const sx of[88,136,184]){R(sx,50,46,82,'#3a2a22');R(sx+2,52,42,78,'#e8b4ae');
     for(let j=0;j<5;j++){const sy=64+j*14;R(sx+2,sy,42,2,'#3a2a22');for(let i=0;i<3;i++){const c=its[(i+j+sx)%6];R(sx+4+i*14,sy-7,11,7,c);R(sx+5+i*14,sy-3,9,2,shade(c,-25));if(j%2)R(sx+6+i*14,sy-6,7,2,'#2f4a3a');}}}
   R(232,56,32,76,'#3a2a22');for(let j=0;j<5;j++){R(232,68+j*12,32,2,'#2b1d18');R(235,60+j*12,10,8,'#2b2b33');R(248,62+j*12,12,6,'#3a3a42');}
   R(66,108,58,3,'#f4f1ec');R(68,111,2,21,'#c9c3b0');R(120,111,2,21,'#c9c3b0');R(74,92,18,16,'#d8d2bf');R(76,94,14,10,'#2f3a34');R(77,95,6,3,'#4f6a5a');R(96,102,22,6,'#e8e2d0');R(97,104,20,2,'#b8b2a0');
   R(160,0,1,14,'#8a6a3a');R(150,14,21,3,'#c9a24a');for(let i=-9;i<=9;i+=6){R(160+i,17,1,4,'#c9a24a');R(159+i,12,3,3,'#f4efe4');}
   break;}
  case 'pillar':R(x-4,20,8,108,'#ffffff');R(x+2,20,2,108,'#e2ddd3');R(x-6,17,12,4,'#f4f1ec');R(x-7,15,14,2,'#d8d2c6');R(x-6,126,12,6,'#e2ddd3');R(x-7,130,14,2,'#d8d2c6');break;
  case 'tallwin':R(x-10,26,20,62,'#d8d2c6');R(x-9,24,18,2,'#d8d2c6');R(x-8,28,16,58,'#bcd8ea');R(x-7,27,14,1,'#bcd8ea');R(x-1,28,2,58,'#d8d2c6');R(x-8,50,16,2,'#d8d2c6');R(x-6,30,3,16,'#e2f0f8');break;
  case 'rtable':R(x-21,108,2,24,'#c9a24a');R(x-21,120,7,2,'#c9a24a');R(x-16,122,1,10,'#c9a24a');R(x+19,108,2,24,'#c9a24a');R(x+14,120,7,2,'#c9a24a');R(x+15,122,1,10,'#c9a24a');
    R(x-14,112,28,3,'#ffffff');R(x-12,115,24,14,'#f4f1ec');R(x-12,115,1,14,'#e2ddd3');R(x-2,129,4,3,'#d8d2c6');R(x-1,104,2,8,'#3fb36a');R(x-3,101,6,4,'#ff8fb0');R(x-9,108,2,4,'#e8f4fa');R(x+7,108,2,4,'#e8f4fa');break;
  case 'mall':{R(0,0,320,10,'#9ccbe6');for(let i=0;i<320;i+=20)R(i,0,2,10,'#e8edf2');R(0,10,320,2,'#c3ced6');
    const up=[[48,110,'#e8e2d0','CARTURESTI','#2b2730'],[112,172,'#f5a623','FOOD COURT','#2b2730']];
    for(const [a,b,c,n,fg] of up){R(a,16,b-a,42,c);R(a+3,26,b-a-6,32,'#bfe3ef');R(a,16,b-a,9,shade(c,-25));txtC(n,(a+b)/2,18,fg==='#2b2730'?'#ffffff':fg);}
    R(178,14,136,44,'#16202c');R(182,16,128,10,'#d7263d');txtC('CINEMA CITY',246,18,'#ffffff');for(let i=0;i<4;i++){R(188+i*30,30,22,26,'#f5c400');R(190+i*30,32,18,22,['#2f86d6','#e0303f','#3fb36a','#8a5bd6'][i]);}
    R(0,58,320,8,'#c3ced6');R(0,66,320,2,'#9aa4ae');txt('ULTIMUL ETAJ',8,59,'#2b3f55');R(0,50,320,8,'rgba(170,215,240,.55)');R(0,49,320,1,'#8a96a3');for(let i=0;i<320;i+=16)R(i,49,1,9,'#8a96a3');
    const dn=[[44,100,'#e0303f','MODA'],[184,236,'#3fb36a','CAFE'],[240,312,'#2f86d6','TECH']];
    for(const [a,b,c,n] of dn){R(a,74,b-a,58,c);R(a+3,86,b-a-6,46,'#bfe3ef');R(a,74,b-a,10,shade(c,-25));txtC(n,(a+b)/2,77,'#ffffff');R(a+(b-a)/2-1,86,2,46,c);}
    R(60,104,10,20,'#f4f1ec');R(78,100,12,24,'#2b2730');R(196,110,24,4,'#7a5a3a');R(250,98,14,10,'#2b2f36');R(276,96,20,12,'#2b2f36');
    for(let i=0;i<22;i++)R(108+i*3,128-i*3,8,3,'#8a96a3');for(let i=0;i<22;i++)R(108+i*3,125-i*3,3,1,'#5d6670');R(106,124,10,8,'#5d6670');R(170,62,10,6,'#5d6670');
    R(104,104,2,24,'#9aa4ae');R(104,104,64,1,'rgba(0,0,0,0)');
    R(118,68,52,11,'#2b3f55');txtC('10:00-22:00',144,71,'#ffffff');R(143,66,1,2,'#8a96a3');
    break;}
  case 'vending':R(x-14,72,28,60,'#2f86d6');R(x-12,76,24,34,'#bfe3ef');for(let j=0;j<3;j++)for(let i=0;i<4;i++)R(x-11+i*6,78+j*11,4,8,['#e0303f','#f5c400','#3fb36a','#8a5bd6'][(i+j)%4]);R(x-12,114,24,10,'#16202c');txtC('CARTI',x,116,'#ffffff');R(x+8,100,3,6,'#16202c');break;
  case 'bench':R(x-18,114,36,3,'#8a5a2b');R(x-18,106,36,3,'#8a5a2b');R(x-16,117,2,15,'#3a3f47');R(x+14,117,2,15,'#3a3f47');break;
  case 'clockBig':for(let r=-10;r<=10;r++){const hw=Math.round(Math.sqrt(100-r*r));R(x-hw,40+r,hw*2,1,'#2b2b33');}for(let r=-8;r<=8;r++){const hw=Math.round(Math.sqrt(64-r*r));R(x-hw,40+r,hw*2,1,'#f6f1e2');}R(x,33,1,7,'#1b1424');R(x,40,5,1,'#1b1424');break;
  case 'shop':R(x-24,40,48,92,d[2]);R(x-22,58,44,74,'#bfe3ef');R(x-1,58,2,74,d[2]);R(x-24,40,48,14,shade(d[2],-30));txtC(d[3],x,45,'#ffffff');R(x-18,100,10,22,'#f4f1ec');R(x+6,96,12,26,'#2b2730');break;
  case 'escalator':for(let i=0;i<24;i++)R(x-24+i*2,120-i*3,8,3,'#8a96a3');R(x-26,124,8,8,'#5d6670');R(x+20,48,8,8,'#5d6670');for(let i=0;i<24;i++)R(x-24+i*2,116-i*3,2,1,'#2b2f36');break;
  case 'cinema':R(x-34,26,68,50,'#16202c');R(x-32,28,64,10,'#d7263d');txtC('ULTIMUL ETAJ',x,31,'#ffffff');txtC('CINEMA CITY',x,44,'#ffd34a');R(x-26,54,52,18,'#2b3f55');for(let i=0;i<5;i++)R(x-24+i*10,56,8,14,'#f4f1ec');R(x-2,76,4,56,'#9aa0aa');break;
  }}

export { BADGE_TOTAL, INT, decorDraw };
