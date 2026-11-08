// The 20 locations, their intro lines and quizzes: [question, right, [wrong...]].

/* ---------- locations + quizzes (quiz: [întrebare, corect, [greșite]]) ---------- */
const LOC={
 bisericaRosie:{name:'Biserica Roșie',lines:['Biserica Roșie, Bulevardul Revoluției 61. Biserică evanghelică-luterană, în stil neogotic, ridicată în 1906.','Privește-o bine: are trei culori principale, intrarea mare din turn și uși secundare pe lateral.','Deasupra intrării e o inscripție. Slujbele aici se țin în limba maghiară. Hai la întrebări!'],
  quiz:[['Câte uși secundare are Biserica Roșie?','4',['1','5','2']],['În ce limbă este scrisul de la intrare?','Maghiară',['Slavă','Română','Bulgară']],['Câte culori principale are biserica?','3',['1','2','4']]]},
 primaria:{name:'Primăria Arad',enter:'primaria',
  quiz:[['Cine este arhitectul Primăriei?','Francisc Pekar',['Pekka Franco','Francisc Luida','Aron Franco']],['Câte globuri are fiecare stâlp de iluminat din fața Primăriei?','5',['7','1','3']],['Primăria este predominant albă. Ce altă culoare mai are?','Gri',['Roz','Roșu','Mov']]]},
 filarmonica:{name:'Filarmonica Arad',enter:'filarmonica',
  quiz:[['În ce ani a fost ridicată clădirea Filarmonicii?','1911–1913',['1915–1917','1915–1918','1910–1911']],['Câte statui sunt de la trepte până la intrare?','1',['2','0','3']],['Care este denumirea alternativă a clădirii?','Palatul Cultural',['Palatul Culturii','Patrimoniul Culturii','Patrimoniul Cultural']]]},
 complexMuzeal:{name:'Complexul Muzeal Arad',enter:'complexMuzeal',
  quiz:[['Câte intrări au scris „MUZEU” deasupra?','2',['4','1','5']],['De obicei, câți porumbei sunt la intrare?','Cel puțin unul',['Niciunul','40','Peste 50']],['Ce găsești chiar la intrare?','Magazinul de suveniruri',['Prima expoziție','Un scurt rezumat','Statuia fondatorului']]]},
 cazinou:{name:'Vechiul Cazinou',enter:'cazinou',
  quiz:[['Câte felinare sunt în fața Cazinoului?','6',['8','4','5']],['Ce eveniment școlar important se ține aici?','Banchetul',['Nunta','Ziua elevului','Aniversarea școlii']],['Cu ce este înconjurat Vechiul Cazinou?','Gard viu',['Mușchi','Licheni','Crovuri']]]},
 moise:{name:'Colegiul Național „Moise Nicoară”',enter:'moise',
  quiz:[['Când a fost construită clădirea colegiului?','1869–1873',['1869','1873','1870–1873']],['Ce se află vizavi de școală?','Un teren de sport',['Un teren de tenis','Un teren de volei','O pistă de aruncat sulița']],['Care a fost fostul nume al liceului, la fel ca al terenului?','Ioan Slavici',['Ion Slavici','Ioan Slav','Ionescu Andrei']]]},
 neptun:{name:'Ștrandul Neptun',lines:['Ștrandul Neptun: 30 de hectare de bazine pe malul Mureșului.','Numără toboganele colorate de lângă bazine și vezi cine se bălăcește cel mai mult.','Ai ascultat ce a zis salvamarul? Urmează quiz-ul!'],
  quiz:[['Câte tobogane are ștrandul?','4',['3','2','1']],['Cum se numește Neptun în mitologia greacă?','Poseidon',['Ares','Apollo','Zeus']],['Pentru ce vârstă e cel mai potrivit ștrandul?','Copii',['Vârstnici','Adulți','Adolescenți']]]},
 avramIancu:{name:'Piața Avram Iancu',lines:['Piața Avram Iancu. În secolul al XVII-lea, aici era primăria orașului.','Uită-te la statuia din mijloc și la casele din jur. Apoi, quiz!'],
  quiz:[['Ce statuie este în mijlocul pieței?','Statuia Soldatului Român',['Statuia Filozofului Român','Statuia Primarului','Statuia lui Ceaușescu']],['Care este cel mai apropiat obiectiv turistic?','Teatrul',['Ștrandul Neptun','Catedrala Sfânta Treime','Stadionul UTA']],['Ce culori au casele din jurul pieței?','Multicolore',['Albe','Negre','Gri']]]},
 muzeuCalc:{name:'Muzeul de Istorie a Calculatoarelor',enter:'muzeuCalc',
  quiz:[['Se vede muzeul din drum?','Oarecum',['Nu','Imposibil','Deloc']],['Ce culoare are clădirea muzeului?','Albastră',['Verde','Galbenă','Roșie']],['Poți vizita muzeul fără programare?','Nu',['Da','Da, fără ghid','Da, cu ghid']]]},
 teatru:{name:'Teatrul Clasic „Ioan Slavici”',enter:'teatru',
  quiz:[['Câte felinare sunt în fața teatrului?','7',['8','4','6']],['În câte săli se pot ține spectacole?','2',['4','1','5']],['De unde se pot cumpăra bilete?','De la intrare',['Din sală','De la primărie','De pe scări']]]},
 sfAnton:{name:'Biserica Romano-Catolică „Sf. Anton”',lines:['Catedrala Romano-Catolică „Sf. Anton de Padova”, Bulevardul Revoluției 96A.','Ridicată între 1902 și 1904, după planurile arhitectului arădean Milan Tabacovici.','Uită-te la statuia de lângă intrare și la șinele din fața bisericii. Urmează quiz-ul!'],
  quiz:[['Ce culori are statuia de la intrare?','Roz și albastru',['Roșu și albastru','Roșu și verde','Galben și roz']],['Cărei comunități i se adresează în principal?','Maghiarilor',['Românilor','Evreilor','Bulgarilor']],['Ce transport public oprește cel mai aproape?','Tramvaiul',['Autobuzul','Taxiul','Trenul']]]},
 biblioteca:{name:'Biblioteca Județeană „A.D. Xenopol”',enter:'biblioteca',
  quiz:[['La ce etaj este secția pentru copii?','Etajul 1',['Parter','Etajul 3','Subsol']],['Ce club a fost inaugurat ultimul în bibliotecă?','3D Printing și Modeling',['Literatură','Filozofie','Fotografie']],['Cât costă accesul anual la bibliotecă?','0 lei, e gratuit',['600 lei','300 lei','120 lei']]]},
 marionete:{name:'Teatrul de Marionete',enter:'marionete',
  quiz:[['Pe unde intră actorii?','Pe o ușă din lateral',['Prin față','Nu există intrare pentru actori','Pe scara exterioară']],['Pentru ce a fost fondat inițial?','Teatru de marionete',['Teatru de mimă','Teatru mut','Teatru de improvizație']],['Care este primul lucru pe care îl vezi la intrare?','O oglindă',['Sala','Scena','Culisele']]]},
 reconcilierii:{name:'Piața Reconcilierii',lines:['Parcul Reconcilierii, pe strada Ioan Calvin.','În mijloc e Statuia Libertății, ridicată în 1890 în memoria celor 13 generali executați la Arad după revoluția din 1848–1849.','Lângă ea e Arcul de Triumf. Numără luminile și caută partea aurită. Quiz!'],
  quiz:[['Câte lumini sunt în jurul statuii celor 13 generali?','17',['13','15','11']],['Ce parte a statuii de pe Arcul de Triumf este aurită?','Degetele',['Pălăria','Arma','Pieptul']],['Comunitatea cărei naționalități are cartierul din zonă?','Maghiară',['Română','Bulgară','Evreiască']]]},
 sfTreime:{name:'Catedrala „Sfânta Treime”',lines:['Catedrala Arhiepiscopală „Sfânta Treime”, din Podgoria.','Lucrările au început în 1991. Are 58 de metri și o cupolă aurie uriașă.','Ai ascultat-o pe doamna Mioara? Urmează quiz-ul!'],
  quiz:[['A câta este ca importanță în municipiul Arad?','Prima',['A doua','A patra','Nu e importantă']],['În ce zonă a orașului se află?','Podgoria',['Micălaca','Vladimirescu','Alfa']],['Cărei religii aparține?','Creștin-ortodoxă',['Creștin-catolică','Protestantă','Neoprotestantă']]]},
 padurice:{name:'Lacul Pădurice',lines:['Lacul Pădurice, între strada Corneliu Coposu, Piața Podgoria și strada Miron Costin.','Uită-te ce animale se plimbă pe alee și pe ce stau oamenii. Quiz!'],
  quiz:[['Ce animal predomină în zona lacului?','Porumbelul',['Căprioara','Ursul brun','Vulpea']],['Ce se întâmplă seara la lac?','Se aprind luminile',['Se sting luminile','Sar peștii','Pescuiesc săritorii']],['Ce obiect predomină în jurul lacului?','Băncile',['Scaunele','Toboganele','Gheretele']]]},
 gara:{name:'Gara CFR Arad',enter:'gara',
  quiz:[['Ce se află în fața gării?','Un tren vechi',['Un vagon','O expoziție','Un turn cu ceas']],['Ce fel de tonomate sunt în gară?','De cărți',['De noroc','De cartele','De suveniruri']],['Cât de des vin trenurile?','Zilnic',['Săptămânal','Lunar','De două ori pe săptămână']]]},
 atrium:{name:'Atrium Mall',enter:'atrium',
  quiz:[['Până la ce oră este deschis Atrium Mall?','22:00',['21:00','23:00','22:30']],['Ce firmă ocupă cel mai mult spațiu la ultimul etaj?','Cinema City',['Mesopotamia','Restaurantul chinezesc','Sala Kratos']],['Câte niveluri are parcarea?','4',['2','3','1']]]},
 afi:{name:'AFI Arad',lines:['AFI Arad, Calea Aurel Vlaicu 14. Parc de retail deschis pe 1 noiembrie 2023.','Citește firmele magazinelor și uită-te ce cartier e alături. Quiz!'],
  quiz:[['Ce magazin sportiv se află în AFI?','Decathlon',['Hervis','Starbucks','Sportisimo']],['Ce magazine sunt atât în AFI, cât și în Atrium Mall?','Cărturești și Mesopotamia',['Cărturești și Carrefour','Starbucks și Cărturești','Media Galaxy și Cărturești']],['Ce comunitate îngrădită se află în apropiere?','ARED City',['ARAD City','RED Arad','RED City']]]},
 stadion:{name:'Stadionul UTA',lines:['Arena „Francisc Neuman”, deschisă pe 28 august 2020, pe locul vechiului stadion.','Caută magazinul de lângă intrare și statuia de vizavi. Quiz!'],
  quiz:[['Ce echipă joacă acasă pe acest stadion?','UTA',['UAT','TUA','TAU']],['Ce mai include clădirea stadionului?','Un magazin de suveniruri',['Un magazin de bilete','Gherete de donații','Locuințe pentru jucători']],['Ce statuie este vizavi de stadion?','Statuia fotbalistului',['Statuia creatorului stadionului','Statuia scriitorului','Statuia filozofului']]]}
};
const LOC_TOTAL=Object.keys(LOC).length;

export { LOC, LOC_TOTAL };
