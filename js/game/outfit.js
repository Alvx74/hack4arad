// Wardrobe options and the saved game (outfit, visited places, badges).
import { COST } from './people.js';

/* ---------- player options ---------- */
const OPT={
  hair:[['chel','Chel'],['scurt','Scurt'],['creasta','Creastă'],['afro','Afro'],['lung','Lung'],['buclat','Buclat'],['sapca','Șapcă UTA']],
  hairC:[['#2a1d17','Negru'],['#6b4226','Șaten'],['#e2c26b','Blond'],['#c4552b','Roșcat'],['#3d7bd9','Albastru'],['#e66fae','Roz'],['#5bbf4a','Verde']],
  skin:[['#f1c9a5','Deschis'],['#e0a878','Mediu'],['#b9784f','Măsliniu'],['#7a4a2e','Închis']],
  shirt:[['alb','Alb simplu'],['negru','Negru'],['rosu','Roșu'],['albastru','Albastru'],['dungi','Marinar cu dungi'],['uta','Roș-alb UTA'],['kyrie','KYRIE GOAT ★']],
  pants:[['blugi','Blugi'],['negri','Negri'],['trening','Trening'],['scurti','Pantaloni scurți'],['cargo','Cargo kaki']],
  shoes:[['albi','Papuci albi'],['negri','Papuci negri'],['rosii','Papuci roșii'],['galbeni','Papuci galbeni'],['slapi','Șlapi']]
};
OPT.costum=[['none','Fără costum'],...Object.entries(COST).map(([k,v])=>[k,'Costum de '+v.n.toLowerCase()])];
const ROWS=[['hair','Păr'],['hairC','Culoare păr'],['skin','Ten'],['shirt','Tricou'],['pants','Pantaloni'],['shoes','Papuci'],['costum','Costum']];
const SHIRTS={alb:{c:'#ecebf2'},negru:{c:'#2b2730'},rosu:{c:'#d23a3a'},albastru:{c:'#3a6fd0'},dungi:{c:'#f2f2f7',pat:'dungi',c2:'#23408f'},uta:{c:'#d7263d',pat:'uta'},kyrie:{c:'#552583',pat:'kyrie'}};
const PANTS={blugi:{c:'#3b5a8c',type:'blugi'},negri:{c:'#26222b'},trening:{c:'#3d3d4a',type:'trening'},scurti:{c:'#c9a46a',type:'scurti'},cargo:{c:'#6b7445'}};
const SHOES={albi:{c:'#f4f4f4'},negri:{c:'#1e1b22'},rosii:{c:'#d7263d'},galbeni:{c:'#f5c400'},slapi:{type:'slapi'}};

/* ---------- save ---------- */
const DEF={outfit:{hair:'chel',hairC:'#2a1d17',skin:'#e0a878',shirt:'alb',pants:'blugi',shoes:'albi',costum:'none'},visited:{},badges:{},started:false};
const SKEY='aradPixelat_v2';
let S=JSON.parse(JSON.stringify(DEF));
try{const raw=localStorage.getItem(SKEY);if(raw){const o=JSON.parse(raw);S=Object.assign(S,o);S.outfit=Object.assign({},DEF.outfit,o.outfit||{});}}catch(e){}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
function playerLook(){const o=S.outfit;return{kind:'human',skin:o.skin,hair:o.hair,hairC:o.hairC,shirt:SHIRTS[o.shirt],pants:PANTS[o.pants],shoes:SHOES[o.shoes],costume:o.costum&&o.costum!=='none'?o.costum:null,acc:{}};}
const bald=()=>S.outfit.hair==='chel'&&(!S.outfit.costum||S.outfit.costum==='none');

export { DEF, OPT, PANTS, ROWS, S, SHIRTS, SHOES, SKEY, bald, playerLook, save };
