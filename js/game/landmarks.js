// Landmark buildings (LD) and street decorations (DECO), drawn from photos.
import { G, R, T, shade } from './core.js';
import { plate, txt, txtC } from './font.js';
import { bench, bricks, dome, door, hedge, lamp, lamp5, lancet, pigeon, roofM, tree, tri, win } from './draw.js';

/* ---------- landmark drawings (x = left edge) ---------- */
const LD={};
LD.moise=(x)=>{
  /* după fotografii: aripi albe cu parter somon, corp central bej cu coloane, balcon, atic cu balustradă și grup statuar */
  const wu='#efe9e2',wg='#e6b89e',band='#dcae92',cw='#e2c3a3',cg='#ddbb98',col2='#cfa684',lt='#f0dcc4',gl='#3d5f86',ring='#d6c8bb';
  const wing=(wx0,xs)=>{R(wx0,G-57,66,2,lt);R(wx0,G-55,66,3,'#e2d6c9');R(wx0,G-52,66,26,wu);R(wx0,G-26,66,3,band);R(wx0,G-23,66,23,wg);
    for(let r=G-19;r<G;r+=4)R(wx0,r,66,1,shade(wg,-10));
    for(const ox of xs){const wx=wx0+ox;R(wx-1,G-48,9,1,ring);R(wx-2,G-47,1,3,ring);R(wx+8,G-47,1,3,ring);win(wx,G-47,7,15,{arch:1,fr:'#f6f1ea',gl});
      R(wx-1,G-20,9,1,band);win(wx,G-19,7,12,{arch:1,fr:'#f6f1ea',gl});R(wx+1,G-5,5,3,'#5a4a42');}};
  wing(x,[6,21,36,51]);wing(x+134,[8,23,38,53]);
  /* corp central */
  R(x+66,G-72,68,66,cw);R(x+66,G-28,68,22,cg);
  R(x+64,G-82,72,2,lt);R(x+66,G-80,68,6,'#e9d2b8');for(let i=0;i<68;i+=8)R(x+69+i,G-78,2,2,col2);R(x+66,G-74,68,2,'#d8b896');
  R(x+64,G-92,72,2,lt);R(x+66,G-90,68,8,lt);for(let i=0;i<66;i+=3)R(x+67+i,G-89,1,6,'#d0b89c');
  for(const px of[x+64,x+130]){R(px,G-96,6,6,lt);R(px+1,G-99,4,3,'#e8e2d8');}
  R(x+71,G-100,58,18,lt);R(x+71,G-100,58,1,'#fbf3e6');txtC('LICEUL',x+100,G-98,'#7a5a3a');R(x+73,G-91,54,7,'#f8f0e2');txtC('MOISE NICOARA',x+100,G-90,'#5a4030');
  const st='#eeeae2',sd='#d4cec4';R(x+84,G-101,33,1,sd);R(x+97,G-113,7,12,st);R(x+96,G-105,9,4,st);R(x+98,G-113,1,12,sd);R(x+99,G-117,3,3,st);R(x+93,G-112,4,1,st);R(x+104,G-112,4,1,st);R(x+91,G-114,2,2,st);R(x+108,G-114,2,2,st);R(x+85,G-106,10,5,st);R(x+85,G-103,12,2,sd);R(x+87,G-109,3,3,st);R(x+106,G-106,10,5,st);R(x+104,G-103,12,2,sd);R(x+111,G-109,3,3,st);
  /* etaj: 5 coloane, 4 ferestre înalte cu frontoane */
  for(let i=0;i<5;i++){const c=x+67+i*15;R(c,G-70,4,40,col2);R(c+3,G-70,1,40,shade(col2,-18));R(c-1,G-72,6,2,lt);R(c-1,G-31,6,1,lt);}
  for(let i=0;i<4;i++){const wx=x+72+i*15;tri(wx-2,G-69,13,4,lt);win(wx,G-63,9,25,{arch:1,fr:'#f4ead8',gl});R(wx+1,G-52,7,1,'#f4ead8');}
  /* balcon cu grilaj și console */
  R(x+66,G-31,68,2,lt);R(x+68,G-37,64,1,'#3a2f2a');for(let i=0;i<64;i+=2)R(x+68+i,G-36,1,5,'#3a2f2a');
  for(let i=0;i<4;i++)R(x+71+i*18,G-29,4,4,col2);
  R(x+93,G-45,1,10,'#555');R(x+94,G-45,2,4,'#2b4fa8');R(x+96,G-45,2,4,'#f5c400');R(x+98,G-45,2,4,'#d7263d');
  R(x+107,G-45,1,10,'#555');R(x+108,G-45,6,4,'#2b4fa8');R(x+110,G-44,2,2,'#f5c400');
  /* parter central: pilaștri și trei uși de lemn arcuite */
  for(const px of[x+66,x+89,x+110,x+131])R(px,G-26,3,20,col2);
  for(const dc of[x+79,x+100,x+121]){R(dc-7,G-27,14,1,lt);R(dc-5,G-26,10,1,'#9a6a45');R(dc-6,G-25,12,19,'#9a6a45');R(dc-4,G-24,8,5,gl);R(dc,G-24,1,5,'#9a6a45');R(dc-4,G-17,3,9,'#7a5235');R(dc+1,G-17,3,9,'#7a5235');R(dc-1,G-14,1,1,'#e8c547');}
  /* trepte late cu ziduri laterale */
  R(x+70,G-6,60,2,'#a9a39b');R(x+68,G-4,64,2,'#b8b2aa');R(x+66,G-2,68,2,'#c6c0b8');
  for(const sx of[x+58,x+134]){R(sx,G-9,8,9,cw);R(sx,G-10,8,1,lt);}
  /* felinare de o parte și de alta a scării */
  for(const lx of[x+54,x+146]){R(lx,G-46,1,46,'#4a4f57');R(lx-3,G-48,7,2,'#4a4f57');R(lx-2,G-46,5,1,'#ffe9a8');R(lx-1,G-2,3,2,'#4a4f57');}
  /* busturile lui Moise Nicoară și Ioan Slavici în fața aripilor */
  for(const bx of[x+29,x+171]){R(bx-5,G-13,10,13,'#d8d2c6');R(bx-6,G-14,12,2,'#e8e1d2');R(bx-3,G-21,6,7,'#4f5a52');R(bx-2,G-24,4,4,'#5f6a62');}
  for(const tx of[x+12,x+188]){R(tx,G-26,1,26,'#6b4a2b');R(tx-3,G-30,7,5,'#6fae4a');R(tx-2,G-33,5,3,'#86c25e');}};
LD.bridge=(x,w)=>{R(x,G-30,w,30,'#3a7ab8');for(let i=0;i<w;i+=9)R(x+i+((T>>3)%9),G-22+(i%3)*5,4,1,'#7fb6e6');R(x,G-34,w,4,'#4a6b3a');
  for(let i=0;i<w;i+=14){R(x+i,G-40,8,6,'#3d6b3f');}R(x,G-12,w,2,'#2f4a3a');R(x,G-2,w,2,'#2f4a3a');for(let i=0;i<w;i+=6){R(x+i,G-10,1,8,'#2f4a3a');}
  for(let i=0;i<w;i+=12){for(let r=0;r<4;r++)R(x+i+r,G-10+r,1,1,'#3e6150');}
  R(x+20,G-34,4,34,'#a39a8a');R(x+19,G-36,6,2,'#c9c0b0');R(x+21,G-46,2,10,'#2f4a3a');R(x+19,G-48,6,2,'#2f4a3a');R(x+20,G-46,4,1,'#ffe9a8');
  plate('PODUL TRAIAN',x+52,G-24,'#2f4a3a','#f4efe4');};
LD.muzeuCalc=(x)=>{const w=64;R(x,G-54,w,54,'#7fb2d9');R(x,G-54,w,2,'#e9f2f6');tri(x+14,G-66,36,12,'#7fb2d9');R(x+30,G-63,4,3,'#e9f2f6');roofM(x,G-60,w,'#6c5b55');R(x,G-54,w,1,'#e9f2f6');
  win(x+6,G-48,7,10,{arch:1});win(x+28,G-48,7,10,{arch:1});win(x+50,G-48,7,10,{arch:1});R(x,G-34,w,1,'#e9f2f6');
  R(x+6,G-26,30,20,'#1b1424');R(x+8,G-24,26,16,'#2b2b33');R(x+12,G-22,16,11,'#c9c3b0');R(x+13,G-21,14,9,'#0b2a12');txt('C:',x+14,G-20,'#39ff7a');if(Math.floor(T/30)%2)R(x+22,G-16,3,1,'#39ff7a');R(x+16,G-11,8,2,'#c9c3b0');
  door(x+44,G-22,12,22,'#3d4f6a');R(x+42,G-31,16,6,'#f4efe4');txtC('PROG',x+50,G-30,'#d7263d');R(x,G-6,w,6,'#6a9ac0');plate('RETRO IT',x+21,G-31,'#1b1424','#39ff7a');
  const tx=x+10;R(tx-1,G-18,3,18,'#6b4a2b');R(tx-12,G-46,24,26,'#3f8f46');R(tx-10,G-50,20,4,'#3f8f46');R(tx-8,G-44,6,4,'#5fb35f');R(tx-12,G-24,24,3,'#2f6f38');};
LD.afi=(x)=>{const w=170,blue='#1f5fbf';R(x+20,G-34,150,34,'#dfe4ea');R(x+20,G-37,150,3,blue);
  const shops=[['DECATHLON','#2f6fd6',46],['CARTURESTI','#e8e2d0',46],['MESOPOTAMIA','#7a2e5a',50]];let sx=x+24;
  for(const [n,c,sw] of shops){R(sx,G-24,sw-4,24,'#2b3f55');R(sx+1,G-22,sw-6,20,'#86b9d6');R(sx-1,G-32,sw-2,8,c);txtC(n,sx+(sw-4)/2,G-30,c==='#e8e2d0'?'#2b2730':'#ffffff');door(sx+(sw-4)/2-4,G-14,8,14,'#2b3f55');sx+=sw;}
  R(x+11,G-44,2,44,'#5d6670');R(x+2,G-72,20,30,blue);R(x+3,G-71,18,28,'#ffffff');R(x+3,G-71,18,12,blue);txtC('AFI',x+12,G-68,'#ffffff',2);txtC('ARAD',x+12,G-55,blue);R(x+7,G-48,10,2,blue);};
/* ---- redesenate după fotografii ---- */
function corin(x,y,h,w,c){const s=shade(c,-22);R(x,y+2,w,h-4,c);R(x+w-1,y+2,1,h-4,s);for(let i=1;i<w-1;i+=2)R(x+i,y+4,1,h-8,shade(c,-10));R(x-1,y,w+2,2,'#f7f1e2');R(x,y+2,w,1,'#e3d7bd');R(x-1,y+h-2,w+2,2,s);}
function dent(x,y,w,c){for(let i=0;i<w;i+=2)R(x+i,y,1,1,c);}
function balus(x,y,w,c){R(x,y,w,1,c);R(x,y+3,w,1,c);for(let i=1;i<w-1;i+=2)R(x+i,y+1,1,2,c);}
function pedi(x,y,w,h,edge,fill){tri(x,y,w,h,edge);tri(x+3,y+2,w-6,h-2,fill);}
function circ(cx,cy,r,c){for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r-dy*dy));if(hw>0)R(cx-hw,cy+dy,hw*2,1,c);}}
function globeLamp(lx,h=30){const c='#3a3f47';R(lx,G-h,1,h,c);R(lx-1,G-2,3,2,c);R(lx-4,G-h-1,9,1,c);const g='#fdf7dc';R(lx-1,G-h-5,3,3,g);R(lx-5,G-h-4,3,3,g);R(lx+3,G-h-4,3,3,g);}

LD.bisericaRosie=(x)=>{const B='#a8402f',Bd='#7e2a22',sl='#5f6670',tr='#efe8dc',gl='#3d556e',c=x+48;
  for(const wx of[x,x+62]){bricks(wx,G-52,34,52,B);R(wx,G-52,34,2,tr);R(wx,G-28,34,2,tr);tri(wx-1,G-66,36,14,sl);
    const t=wx===x?wx+1:wx+30;R(t,G-70,3,18,Bd);tri(t-1,G-78,5,8,sl);
    for(const dx of[7,21]){lancet(wx+dx-1,G-48,8,18,tr);lancet(wx+dx,G-47,6,17,gl);R(wx+dx+2,G-42,1,12,tr);}
    for(const dx of[7,21]){lancet(wx+dx-1,G-24,8,24,tr);lancet(wx+dx,G-23,6,23,'#5a3220');R(wx+dx+4,G-12,1,1,'#e8c547');}}
  const tx=x+31;bricks(tx,G-104,34,104,B);R(tx,G-104,2,104,Bd);R(tx+32,G-104,2,104,Bd);
  tri(tx+1,G-70,32,14,tr);tri(tx+4,G-67,26,11,B);R(c-12,G-56,24,2,tr);
  circ(c,G-46,8,tr);circ(c,G-46,6,gl);R(c-6,G-46,12,1,tr);R(c,G-52,1,12,tr);circ(c,G-46,2,'#c9a24a');
  R(c-9,G-36,18,3,tr);dent(c-8,G-35,16,Bd);
  lancet(c-9,G-32,18,32,tr);lancet(c-7,G-30,14,30,'#5a3220');R(c,G-26,1,26,'#3a2010');
  R(tx,G-82,34,2,tr);for(const dx of[6,14,22]){lancet(tx+dx,G-80,5,22,Bd);lancet(tx+dx+1,G-79,3,20,'#2b1a18');}
  R(tx,G-90,34,2,tr);for(let i=2;i<34;i+=4)R(tx+i,G-88,2,2,tr);
  circ(c,G-97,5,tr);circ(c,G-97,4,'#f6f1e2');R(c,G-100,1,3,'#1b1424');R(c,G-97,3,1,'#1b1424');
  tri(tx-1,G-112,8,8,sl);tri(tx+27,G-112,8,8,sl);R(tx,G-105,34,2,tr);tri(tx+3,G-130,28,26,sl);R(c-1,G-131,2,2,tr);
  R(x,G-4,96,4,'#6a241d');};

LD.primaria=(x)=>{const w=170,W1='#f4f2ee',sd='#d8d5cf',tr='#ffffff',gr='#8c96a3',rr='#b5523b',gl='#4a6278',c=x+85;
  R(x+28,G-66,114,8,rr);for(let i=0;i<114;i+=6)R(x+28+i,G-66,1,8,shade(rr,-15));R(x+50,G-69,4,4,'#9a4030');R(x+118,G-69,4,4,'#9a4030');
  for(const px of[x,x+142]){for(let r=0;r<12;r++){const ins=Math.round((11-r)/2.5);R(px+ins,G-70+r,28-2*ins,1,gr);}circ(px+14,G-63,2,tr);R(px+13,G-74,2,4,'#c9ccd2');
    R(px,G-58,28,58,W1);R(px,G-58,28,2,tr);dent(px,G-56,28,sd);
    for(const dx of[6,16]){tri(px+dx-1,G-51,8,3,tr);win(px+dx,G-46,6,11,{fr:tr,gl});win(px+dx,G-20,6,13,{arch:1,fr:tr,gl});}
    R(px,G-30,28,2,tr);for(let r=G-26;r<G-4;r+=3)R(px,r,28,1,sd);}
  for(const sx of[x+28,x+108]){R(sx,G-58,34,58,W1);R(sx,G-58,34,2,tr);dent(sx,G-56,34,sd);
    for(let i=0;i<3;i++){const wx=sx+4+i*11;tri(wx-1,G-51,8,3,tr);win(wx,G-46,6,11,{fr:tr,gl});win(wx,G-20,6,13,{arch:1,fr:tr,gl});}
    R(sx,G-30,34,2,tr);for(let r=G-26;r<G-4;r+=3)R(sx,r,34,1,sd);}
  const rx=x+62;R(rx,G-76,46,76,W1);R(rx,G-76,46,2,tr);pedi(rx-2,G-88,50,12,tr,'#ebe8e2');txtC('ARAD',c,G-83,'#8a8f98');
  for(let i=0;i<5;i++)win(rx+3+i*9,G-72,6,9,{fr:tr,gl});R(rx,G-62,46,2,tr);
  for(let i=0;i<3;i++){const ax=rx+5+i*13;R(ax+1,G-58,8,1,tr);R(ax,G-57,10,18,tr);R(ax+1,G-56,8,17,'#2f3a46');R(ax+2,G-55,6,4,gl);}
  balus(rx+3,G-42,40,tr);R(rx,G-38,46,2,tr);
  for(const px of[rx,rx+14,rx+28,rx+42])R(px+1,G-36,3,36,sd);
  for(let i=0;i<3;i++){const ax=rx+5+i*13;R(ax+1,G-30,8,1,'#2b2f36');R(ax,G-29,10,29,'#2b2f36');R(ax+1,G-28,8,10,'#3d4a58');}
  const tx=c-9;R(tx,G-112,18,36,W1);R(tx,G-112,18,1,tr);tri(tx+3,G-99,12,3,tr);win(tx+6,G-96,6,8,{fr:tr,gl});
  circ(c,G-106,4,'#2a2a30');circ(c,G-106,3,'#f6f1e2');R(c,G-108,1,2,'#1b1424');R(c,G-106,2,1,'#1b1424');
  R(tx-1,G-114,20,2,tr);R(tx+1,G-124,16,10,W1);for(let i=0;i<3;i++)R(tx+3+i*5,G-122,3,7,'#3a4450');R(tx,G-125,18,1,tr);
  dome(c,G-125,5,'#c9ccd2','#e6e8ec');R(c,G-131,1,2,'#3a3f47');R(c+1,G-131,1,2,'#2b4fa8');R(c+2,G-131,1,2,'#f5c400');R(c+3,G-131,1,2,'#d7263d');
  R(x,G-4,w,4,'#b9bcc2');lamp5(x+54);lamp5(x+116);};

LD.palatCultural=(x)=>{const wall='#e4dfd2',sd='#cfc8b6',tr='#f6f2e8',rf='#4f5764',gl='#3e4c5c',c=x+95;
  for(let r=0;r<24;r++){const ins=Math.round(r*0.85);R(x+66+ins,G-96-r,58-2*ins,1,r%4===0?'#5d6573':rf);}
  R(c-6,G-128,12,8,'#3d434e');R(c-5,G-126,10,4,'#5a6b7d');R(c-7,G-129,14,1,'#2b2f36');R(c-1,G-131,2,2,'#2b2f36');
  R(x+66,G-96,58,30,'#f2eee6');R(x+66,G-96,58,2,tr);for(let i=0;i<4;i++)win(x+79+i*9,G-90,5,12,{fr:tr,gl});
  for(const px of[x+66,x+118]){R(px,G-102,6,36,'#f2eee6');R(px+1,G-104,4,2,tr);}
  for(const wx of[x,x+124]){R(wx,G-62,66,62,wall);balus(wx,G-66,66,tr);R(wx,G-62,66,2,tr);
    for(let r=G-58;r<G-4;r+=6)R(wx,r,66,1,sd);for(let i=0;i<66;i+=11)R(wx+i,G-58,1,54,sd);
    for(let i=0;i<5;i++){const w2=wx+5+i*12;R(w2-1,G-54,8,10,tr);R(w2,G-53,6,8,'#e9e3d6');win(w2+1,G-38,4,12,{fr:tr,gl});}
    R(wx,G-6,66,6,'#c2bba8');}
  for(const tx of[x+8,x+182]){R(tx-8,G-74,16,74,'#ece6d8');R(tx-8,G-74,16,2,tr);for(const fy of[G-68,G-48])win(tx-2,fy,4,10,{arch:1,fr:tr,gl});
    dome(tx,G-74,8,'#5b6470','#7d8694');R(tx-2,G-86,4,4,'#ece6d8');R(tx-1,G-89,2,3,'#5b6470');}
  R(x+66,G-66,58,60,'#ddd5c2');for(let i=0;i<3;i++)win(x+82+i*10,G-58,4,14,{fr:tr,gl});
  pedi(x+62,G-82,66,14,tr,'#e7dcc6');R(c-6,G-76,12,6,'#cfc2a6');R(c-4,G-75,2,4,'#a89a7e');R(c+2,G-75,2,4,'#a89a7e');R(c-12,G-73,4,3,'#cfc2a6');R(c+8,G-73,4,3,'#cfc2a6');
  R(x+64,G-68,62,6,tr);txtC('PALATUL CULTURAL',c,G-67,'#5a5246');
  for(let i=0;i<6;i++)corin(x+68+i*10,G-62,56,5,'#f1ecdf');
  R(c-5,G-22,10,16,'#7a4a2a');R(c,G-21,1,15,'#5a3520');R(c-6,G-23,12,1,tr);
  for(let s=0;s<3;s++)R(x+64-s*2,G-6+s*2,62+s*4,2,'#d6cfbf');
  R(c-13,G-15,3,9,'#3a3a3e');R(c-13,G-17,3,2,'#3a3a3e');
  for(const bx of[x+56,x+134]){R(bx-3,G-14,6,14,'#d8d2c6');R(bx-2,G-19,4,5,'#4f5a52');}
  door(x+34,G-20,12,20,'#3e2a1d',1);plate('MUZEU',x+40,G-27,'#1b1424','#ffd34a');
  door(x+150,G-20,12,20,'#3e2a1d',1);plate('MUZEU',x+156,G-27,'#1b1424','#ffd34a');
  const p=Math.floor(T/30)%2;pigeon(x+26,G-3-p,1);pigeon(x+48,G-3,-1);pigeon(x+164,G-3-(1-p),-1);};

LD.cazinou=(x)=>{const cr='#f3e6d2',wh='#fffaf2',sd='#e0cfb4',gl='#3d4f60';
  R(x+100,G-78,50,4,'#3a3f47');R(x+100,G-74,42,66,'#5f7486');for(let i=0;i<42;i+=7)R(x+100+i,G-74,1,66,'#3a3f47');for(let j=G-74;j<G-8;j+=16)R(x+100,j,42,1,'#3a3f47');R(x+104,G-70,10,20,'#8fa7ba');
  R(x+142,G-74,8,66,'#d6ccbc');R(x+118,G-24,14,16,'#2b2f36');R(x+116,G-26,18,2,'#3a3f47');
  R(x+38,G-80,24,12,cr);R(x+36,G-82,28,2,'#3a3f47');circ(x+50,G-74,3,wh);circ(x+50,G-74,2,gl);R(x+40,G-86,2,4,'#3a3f47');R(x+58,G-86,2,4,'#3a3f47');
  R(x,G-68,100,1,'#bcd6e6');balus(x,G-66,100,wh);R(x,G-62,100,6,cr);for(let i=4;i<100;i+=9)R(x+i,G-61,3,3,sd);R(x,G-56,100,1,wh);
  R(x,G-55,100,47,cr);
  for(let i=0;i<5;i++){const wx=x+8+i*18;R(wx,G-49,12,1,wh);R(wx,G-48,12,40,wh);R(wx+1,G-47,10,38,gl);R(wx+2,G-46,8,1,'#c9a24a');R(wx+1,G-44,2,34,'#d8b860');R(wx+9,G-44,2,34,'#d8b860');R(wx+5,G-47,1,38,wh);}
  for(let i=0;i<6;i++){const px=x+2+i*18;R(px,G-54,2,46,wh);R(px+3,G-54,2,46,wh);R(px+2,G-54,1,46,sd);R(px-1,G-56,7,2,wh);R(px-1,G-10,7,2,sd);}
  R(x,G-8,150,8,'#e2d5bf');for(let s=0;s<3;s++)R(x+36-s*2,G-8+s*3,28+s*4,1,'#cfc0a6');
  hedge(x,34);hedge(x+66,34);
  for(let i=0;i<6;i++)lamp(x+4+i*18,22);};

LD.neptun=(x)=>{const w=170;
  for(let i=0;i<w;i+=14){circ(x+i+7,G-46,9,'#2f6f38');circ(x+i+3,G-40,7,'#3f8f46');}
  R(x,G-36,w,36,'#5fb6e0');R(x,G-36,w,2,'#e7e2d8');for(let i=0;i<w;i+=8)R(x+i+((T>>4)%8),G-28+(i%3)*7,4,1,'#bfe6f8');
  R(x+60,G-66,2,52,'#9aa3ad');R(x+70,G-66,2,52,'#9aa3ad');for(let j=G-62;j<G-14;j+=8)R(x+60,j,12,1,'#9aa3ad');
  for(let r=0;r<50;r++){const sx=x+60+Math.round(r*0.55);for(let k=0;k<6;k++)R(sx+k*2,G-66+r,2,1,k%2?'#f5c400':'#7a4fc2');}
  R(x+96,G-72,2,72,'#9aa3ad');for(let r=0;r<34;r++){const ox=Math.round(Math.sin(r/5)*7)+Math.round(r*0.3);R(x+100+ox,G-70+r*2,4,2,'#d7263d');R(x+100+ox,G-70+r*2,1,2,'#a51b2d');}
  R(x+120,G-52,2,52,'#9aa3ad');for(let r=0;r<40;r++){const sx=x+122+Math.round(r*0.5)+(r>20?Math.round((r-20)*0.4):0);R(sx,G-52+r,5,1,'#f5c400');R(sx,G-52+r,1,1,'#c99a00');}
  R(x+138,G-60,2,60,'#9aa3ad');R(x+136,G-62,6,2,'#7d8694');for(let r=0;r<48;r++){const sx=x+140+Math.round(r*0.6);R(sx,G-60+r,5,2,'#2f6fd6');R(sx,G-60+r,5,1,'#5f9ff0');}
  R(x+128,G-17,3,2,'#f1c9a5');R(x+128,G-19,3,2,'#6b4226');
  R(x+18,G-42,2,42,'#2b5f8f');R(x+50,G-42,2,42,'#2b5f8f');R(x+18,G-44,34,6,'#2b5f8f');txtC('STRANDUL',x+35,G-43,'#fff');
  plate('NEPTUN',x+35,G-34,'#f5c400','#1b1424');for(let i=0;i<w;i+=5)R(x+i,G-10,1,10,'#e7e2d8');R(x,G-10,w,1,'#e7e2d8');};

LD.avramIancu=(x)=>{const st='#a9a59c',sd='#8f8b82',bz='#3f4a44',bl='#56645b';
  R(x,G-2,84,2,'#c9c0b0');
  for(const hx of[x+2,x+62]){circ(hx+10,G-6,6,'#3f8f46');circ(hx+5,G-5,4,'#2f6f38');circ(hx+15,G-5,4,'#2f6f38');}
  R(x+20,G-4,44,4,sd);R(x+22,G-7,40,3,st);R(x+24,G-10,36,3,sd);
  R(x+28,G-34,28,24,st);R(x+28,G-34,28,1,'#c4c0b6');R(x+54,G-34,2,24,sd);R(x+36,G-22,12,4,'#c4c0b6');
  R(x+40,G-66,5,10,bz);R(x+39,G-70,6,5,bl);R(x+40,G-72,4,2,bz);R(x+38,G-56,9,22,bz);R(x+44,G-62,2,26,'#2b3330');R(x+45,G-66,1,8,'#2b3330');R(x+39,G-56,3,10,bl);
  R(x+30,G-50,7,16,bz);R(x+31,G-55,5,5,bl);R(x+48,G-46,7,12,bz);R(x+49,G-50,5,4,bl);R(x+50,G-40,8,6,bz);
  R(x+78,G-26,1,26,'#555');R(x+68,G-40,22,13,'#1f4fa0');R(x+69,G-39,20,11,'#2a63c4');txtC('PIATA',x+79,G-38,'#fff');txtC('IANCU',x+79,G-33,'#fff');};

LD.teatru=(x)=>{const W1='#f3f4f6',gy='#d5d9de',sd='#c3c8cf',tr='#ffffff',gl='#3e4c5c',c=x+64;
  R(x,G-82,128,82,W1);balus(x,G-86,128,tr);R(x,G-82,128,2,tr);
  R(x,G-24,128,24,gy);for(let r=G-21;r<G-2;r+=3)R(x,r,128,1,sd);R(x,G-26,128,2,tr);
  R(x,G-50,128,2,tr);R(x,G-68,128,1,sd);
  for(const wx of[x+4,x+14,x+108,x+118]){tri(wx-1,G-64,8,3,tr);win(wx,G-61,6,9,{fr:tr,gl});tri(wx-1,G-46,8,3,tr);win(wx,G-43,6,12,{fr:tr,gl});}
  R(x+23,G-86,82,86,W1);pedi(x+21,G-104,86,18,tr,'#e4e7eb');
  for(let i=0;i<9;i++){const fx=x+36+i*6;R(fx,G-94+Math.abs(4-i),3,8-Math.abs(4-i),'#cfd4da');}
  R(c-1,G-108,3,4,tr);
  R(x+22,G-86,84,6,tr);txtC('TEATRUL IOAN SLAVICI',c,G-85,'#c9a24a');
  for(let i=0;i<5;i++){const wx=x+33+i*14;win(wx,G-74,5,7,{fr:tr,gl});tri(wx-1,G-56,7,3,tr);win(wx,G-53,5,12,{fr:tr,gl});}
  for(let i=0;i<6;i++)corin(x+26+i*14,G-80,54,5,'#eef0f2');
  R(x+23,G-26,82,24,gy);for(let r=G-21;r<G-2;r+=3)R(x+23,r,82,1,sd);R(x+23,G-26,82,2,tr);
  for(const ac of[c-20,c,c+20]){R(ac-7,G-24,14,24,'#e9ecef');R(ac-5,G-22,10,22,'#2b2f36');R(ac-4,G-23,8,1,'#2b2f36');R(ac-3,G-12,6,12,'#1b1e24');
    R(ac,G-21,1,2,'#3a3f47');R(ac-1,G-19,3,3,'#ffe9a8');}
  for(const lx of[c-30,c-10,c+10,c+30]){R(lx,G-18,1,2,'#3a3f47');R(lx-1,G-16,3,4,'#3a3f47');R(lx,G-15,1,2,'#ffe9a8');}
  R(x+6,G-24,10,18,'#c0102a');R(x+7,G-22,8,2,'#ffffff');R(x+7,G-18,8,8,'#7a1f2f');
  plate('BILETE',x+113,G-14,'#5a2a1e','#ffd34a');R(x,G-2,128,2,sd);
  const ox=x+142;R(ox-10,G-6,20,6,'#e8e4dc');R(ox-7,G-14,14,8,'#efebe3');for(let r=0;r<60;r++){const hw=Math.max(1,Math.round(4-r/20));R(ox-hw,G-14-r,hw*2,1,'#d8d0bf');}
  circ(ox,G-76,2,'#c9a24a');R(ox-3,G-80,7,1,'#3a3f47');R(ox,G-83,1,7,'#3a3f47');
  R(ox-6,G-36,12,22,'#2f3530');R(ox-4,G-42,8,6,'#2f3530');R(ox-1,G-50,2,10,'#2f3530');R(ox-3,G-47,6,1,'#2f3530');R(ox-8,G-30,3,10,'#3f4740');R(ox+5,G-28,3,10,'#3f4740');};

LD.sfAnton=(x)=>{const W1='#f2f2f0',sd='#d6d6d2',tr='#ffffff',gl='#3e4c5c',gr='#a3a9b2',c=x+70;
  for(const wx of[x,x+94]){for(let r=0;r<10;r++){const ins=Math.round((9-r)/2);R(wx+ins,G-80+r,46-2*ins,1,gr);}
    for(let i=8;i<40;i+=12)circ(wx+i,G-75,1,'#e8eaec');
    R(wx,G-70,46,70,W1);R(wx,G-70,46,2,tr);dent(wx,G-68,46,sd);
    for(const fy of[G-62,G-46,G-32]){for(let i=0;i<4;i++)win(wx+4+i*11,fy,6,10,{fr:tr,gl});if(fy!==G-62){R(wx+2,fy+8,42,1,'#2b2b33');for(let i=2;i<44;i+=2)R(wx+i,fy+9,1,2,'#2b2b33');R(wx+2,fy+11,42,1,'#2b2b33');}}
    R(wx,G-18,46,18,'#2b2f36');R(wx+2,G-14,42,12,'#5a7488');R(wx,G-18,46,4,wx===x?'#f5c400':'#e8e0c8');txtC(wx===x?'MAGAZIN':'BIJUTERIE',wx+23,G-17,'#2b2730');}
  R(c-12,G-102,24,16,W1);for(let i=0;i<24;i+=4)R(c-12+i,G-102,1,16,sd);circ(c-6,G-96,2,'#2b2b33');circ(c+6,G-96,2,'#2b2b33');lancet(c-2,G-98,4,8,'#3a3f47');
  R(c-13,G-103,26,1,tr);for(const bx of[c-12,c-6,c+5,c+10])R(bx,G-106,2,3,tr);
  dome(c,G-103,12,'#6aa88f','#94d0b8');R(c-1,G-120,3,6,'#6aa88f');circ(c,G-121,2,'#c9a24a');R(c,G-130,1,8,'#3a3f47');R(c-2,G-127,5,1,'#3a3f47');
  R(c-24,G-86,48,86,W1);R(c-26,G-86,52,2,tr);
  for(const ax of[c-20,c+15]){R(ax,G-94,5,8,tr);R(ax,G-100,5,6,'#eef0f2');R(ax+1,G-102,3,2,'#eef0f2');}
  for(let i=0;i<3;i++){const nx=c-11+i*8;R(nx,G-84,6,9,'#e9c48a');R(nx+2,G-83,2,7,'#f8f0e2');}
  R(c-24,G-74,48,4,'#d8dadd');for(let i=0;i<44;i+=3)R(c-22+i,G-73,2,1,'#5a5f68');
  for(let r=0;r<12;r++){const hw=Math.round(Math.sqrt(144-(12-r)*(12-r)));R(c-hw,G-68+r,hw*2,1,tr);}
  R(c-10,G-58,20,52,'#e6e7e9');circ(c,G-56,9,'#d9dcde');circ(c,G-56,7,'#c7cbd0');R(c-2,G-60,4,6,'#9aa0a8');
  R(c-6,G-34,12,28,'#2b2f36');R(c-7,G-36,14,2,tr);R(c,G-34,1,28,'#1b1e24');
  for(const px of[c-23,c-17,c+12,c+18])corin(px,G-70,64,5,'#f6f6f4');
  R(c-28,G-6,56,2,'#dcdcd8');R(c-30,G-4,60,2,'#d0d0cc');R(c-32,G-2,64,2,'#c6c6c2');
  const sx=c-30;R(sx-3,G-10,7,10,'#d8d2c6');R(sx-2,G-20,5,10,'#f2a0b8');R(sx-3,G-18,2,8,'#4a7bd0');R(sx+2,G-18,2,8,'#4a7bd0');R(sx-1,G-24,3,4,'#f1c9a5');R(sx-2,G-25,5,2,'#4a7bd0');};

LD.biblioteca=(x)=>{const W1='#f3f2ee',sd='#d9d7d0',tr='#ffffff',gl='#2f3a46',c=x+60;
  R(x,G-70,120,70,W1);R(x,G-70,120,2,tr);dent(x,G-68,120,sd);
  R(x,G-26,120,26,'#eceae4');for(let r=G-23;r<G;r+=4){R(x,r,120,1,sd);for(let i=((r>>2)%2)*6;i<120;i+=12)R(x+i,r-3,1,3,sd);}
  R(x,G-28,120,2,tr);R(x,G-48,120,2,tr);
  for(const wx of[x+6,x+20,x+90,x+104]){R(wx-1,G-45,9,1,tr);win(wx,G-44,7,14,{arch:1,fr:tr,gl});
    win(wx,G-64,3,12,{fr:tr,gl});win(wx+4,G-64,3,12,{fr:tr,gl});R(wx-1,G-67,9,2,'#e2e0d8');win(wx,G-21,7,12,{fr:tr,gl});}
  R(c-20,G-74,40,74,W1);R(c-20,G-74,1,74,sd);R(c+19,G-74,1,74,sd);
  pedi(c-22,G-88,44,14,tr,'#f0efea');dent(c-18,G-75,36,sd);
  for(const fx of[c-22,c+19,c-1])R(fx,G-92,3,4,'#e8e6e0');
  for(const wx of[c-14,c+6]){win(wx,G-64,3,12,{fr:tr,gl});win(wx+4,G-64,3,12,{fr:tr,gl});R(wx-1,G-67,9,2,'#e2e0d8');}
  for(let r=0;r<8;r++){const hw=Math.round(Math.sqrt(64-(8-r)*(8-r)));R(c-hw-2,G-30+r,(hw+2)*2,1,tr);}
  R(c-8,G-22,16,22,'#4a2e1c');R(c,G-22,1,22,'#2f1a10');R(c-11,G-24,3,24,'#7a6a5a');R(c+8,G-24,3,24,'#7a6a5a');R(c-12,G-26,24,2,'#6a5a4a');
  R(c-14,G-34,1,8,'#555');R(c-20,G-34,6,4,'#2b4fa8');R(c+13,G-34,1,8,'#555');R(c+14,G-34,2,4,'#2b4fa8');R(c+16,G-34,2,4,'#f5c400');R(c+18,G-34,2,4,'#d7263d');
  plate('BIBLIOTECA',c,G-42,'#1b1424','#ffd34a');
  R(x+90,G-8,1,8,'#5d4637');R(x+103,G-8,1,8,'#5d4637');R(x+82,G-20,30,13,'#3fb36a');txtC('ACCES',x+97,G-18,'#fff');txtC('GRATUIT',x+97,G-12,'#fff');};

LD.marionete=(x)=>{const Y='#ece4a8',Y2='#e3d27a',tr='#fbf8ea',sd='#d6cc8a';
  R(x,G-52,20,52,Y);R(x,G-52,20,2,tr);R(x+4,G-46,12,18,tr);win(x+5,G-45,10,16,{fr:tr,gl:'#5f7486'});
  R(x+5,G-26,10,26,'#e8d070');R(x+6,G-24,8,24,'#e3c95a');for(let j=G-22;j<G-2;j+=4)R(x+7,j,6,2,'#cdb34a');plate('ACTORI',x+10,G-31,'#2a1d40','#ffd34a');
  R(x+20,G-66,64,66,Y);R(x+20,G-66,64,2,tr);R(x+16,G-60,4,60,Y);R(x+84,G-60,4,60,Y);R(x+18,G-62,68,1,sd);
  for(const ax of[x+24,x+70]){R(ax,G-56,12,24,tr);R(ax+1,G-55,10,1,Y);R(ax+2,G-54,8,22,'#5f7486');for(let i=1;i<4;i++)R(ax+2+i*2,G-54,1,22,tr);R(ax+2,G-42,8,1,tr);}
  R(x+38,G-64,30,34,'#8fa0e0');R(x+40,G-62,26,30,'#ffffff');circ(x+53,G-47,8,'#e0303f');R(x+48,G-48,10,1,'#ffffff');R(x+49,G-45,8,1,'#ffffff');
  const fc=['#3fb36a','#f5a623','#8a5bd6','#e0303f','#2f86d6','#c98a5a'];for(let i=0;i<6;i++){R(x+41,G-61+i*5,3,3,fc[i]);R(x+62,G-61+i*5,3,3,fc[5-i]);}R(x+40,G-34,26,2,'#8fa0e0');
  R(x+16,G-28,72,2,'#5d6670');for(const sx of[x+24,x+40,x+62,x+78])R(sx,G-31,4,3,'#1b1424');
  R(x+20,G-26,64,26,Y2);for(const dx of[x+34,x+48,x+62]){R(dx-1,G-24,10,24,'#d6c060');R(dx,G-23,8,23,'#e8d070');for(let j=0;j<5;j++)for(let i=0;i<2;i++)R(dx+1+i*4,G-21+j*4,2,3,'#3d4f60');}
  for(const wx of[x+22,x+74]){R(wx,G-22,8,12,'#5f7486');for(let i=0;i<8;i+=2)R(wx+i,G-22,1,12,'#d6c060');R(wx,G-16,8,1,'#d6c060');}
  R(x+20,G-4,64,4,sd);
  R(x+88,G-56,36,56,Y);R(x+88,G-56,36,2,tr);R(x+92,G-50,28,2,tr);for(let i=0;i<3;i++){win(x+93+i*9,G-47,7,14,{fr:tr,gl:'#5f7486'});win(x+93+i*9,G-24,7,14,{fr:tr,gl:'#5f7486'});}R(x+92,G-28,28,2,tr);};

LD.reconcilierii=(x)=>{const w=180;R(x,G-6,w,6,'#7aa86a');for(let i=0;i<w;i+=7)R(x+i,G-6,3,1,'#9cc78a');tree(x+8);tree(x+172);
  const sx=x+50,st='#8f969c',sd='#767d84',bz='#3d4a44',bh='#56645b';
  for(let i=0;i<17;i++){const lx=sx-34+i*4;R(lx,G-3,2,3,'#3a3f47');R(lx,G-5,2,2,'#fff3b0');}
  R(sx-24,G-8,48,4,sd);R(sx-20,G-12,40,4,st);
  R(sx-15,G-36,30,24,st);R(sx-15,G-36,30,2,'#a9b0b6');R(sx+13,G-36,2,24,sd);for(const mx of[sx-10,sx-2,sx+6])circ(mx+2,G-24,3,'#4f6056');
  R(sx-5,G-74,10,38,st);R(sx-6,G-76,12,2,'#a9b0b6');
  R(sx-14,G-46,7,10,bz);R(sx-13,G-50,4,4,bh);R(sx+8,G-46,7,10,bz);R(sx+10,G-51,4,5,bh);R(sx-6,G-44,12,8,bz);R(sx-3,G-48,5,4,bh);
  for(let r=0;r<16;r++)R(sx-12+Math.round(r/3),G-62+r,3,1,bz);R(sx-2,G-58,4,12,bz);R(sx-1,G-61,3,3,bh);R(sx+2,G-66,1,8,bz);R(sx+1,G-67,3,1,'#c9a24a');
  R(sx-4,G-94,8,18,bz);R(sx-3,G-98,6,4,bh);R(sx-2,G-99,4,1,'#c9c0b0');R(sx-4,G-100,1,8,bz);circ(sx-5,G-104,3,bz);circ(sx-5,G-104,1,'#7aa86a');R(sx+4,G-88,4,6,bh);R(sx+5,G-82,1,8,'#c9c0b0');
  const ax=x+130,ac='#ebdfc4',as='#d6c8a8';R(ax-26,G-76,52,76,ac);R(ax-28,G-58,56,3,as);R(ax-27,G-78,54,2,as);
  R(ax-9,G-44,18,44,'#b8d4e8');for(let r=0;r<9;r++){const hw=Math.round(Math.sqrt(81-(9-r)*(9-r)));R(ax-hw,G-53+r,hw*2,1,'#b8d4e8');}R(ax-9,G-8,18,8,'#7aa86a');
  R(ax-24,G-46,13,38,bz);for(let i=0;i<4;i++){R(ax-23+i*3,G-44+(i%2)*3,3,4,bh);R(ax-23+i*3,G-40,2,30,'#4a5a50');}
  R(ax+11,G-44,13,36,bz);for(let i=0;i<3;i++){R(ax+12+i*4,G-42,3,4,bh);R(ax+12+i*4,G-38,3,28,'#4a5a50');}
  for(let i=0;i<5;i++){R(ax-8+i*3,G-18,2,18,'#2f3a34');R(ax-8+i*3,G-21,3,3,bz);R(ax-9+i*3,G-22,4,1,'#1f2824');}
  R(ax-17,G-74,4,12,bz);R(ax-16,G-77,3,3,bh);R(ax-13,G-80,1,10,bz);R(ax-14,G-82,3,2,'#e2b23a');
  R(ax+12,G-72,4,10,bz);R(ax+13,G-75,3,3,bh);R(ax+16,G-76,5,2,bz);
  plate('PARCUL RECONCILIERII',x+92,G-114,'#1b1424','#ffd34a');};

LD.padurice=(x)=>{const w=170;
  for(let i=0;i<w;i+=16){circ(x+i+8,G-38,10,'#2f6f45');circ(x+i+4,G-32,7,'#3f8f46');R(x+i+7,G-26,2,4,'#6b4a2b');}
  R(x,G-24,w,18,'#3f7f9f');for(let i=0;i<w;i+=7)R(x+i+((T>>4)%7),G-20+(i%3)*4,4,1,'#8fc4dc');
  const fh=40+((T>>3)%3);R(x+79,G-24-fh,3,fh,'#e8f4fa');R(x+77,G-24-fh,7,2,'#ffffff');R(x+74,G-36,2,12,'#d4ecf6');R(x+85,G-36,2,12,'#d4ecf6');for(let i=0;i<6;i++)R(x+70+i*4,G-26-(((T+i*7)>>2)%6),1,1,'#ffffff');
  R(x+77,G-24,8,2,'#3a6b4a');
  const px=x+124;R(px,G-26,40,20,'#9fc4d8');for(let i=0;i<40;i+=6)R(px+i,G-26,1,20,'#e8edf2');for(let r=0;r<16;r++){const o=Math.round(r*1.2);R(px+o,G-42+r,40-o,1,r%3?'#b6d4e4':'#e8edf2');}R(px,G-42,2,36,'#e8edf2');
  R(x,G-6,w,6,'#c9bfa8');for(let i=0;i<w;i+=6)R(x+i,G-12,1,6,'#9aa3ad');R(x,G-12,w,1,'#9aa3ad');
  for(const bx of[x+16,x+48,x+100,x+140])bench(bx);
  for(const lx of[x+36,x+66,x+96,x+130,x+160]){R(lx,G-22,1,16,'#3a3f47');R(lx-1,G-24,3,2,'#fff3b0');}
  const p=Math.floor(T/20)%3;pigeon(x+10,G-2,1);pigeon(x+31,G-3+(p===1?-1:0),-1);pigeon(x+58,G-2,1);pigeon(x+74,G-2-(p===2?1:0),-1);pigeon(x+112,G-2,1);pigeon(x+154,G-2,1);
  R(x+2,G-40,1,30,'#6b4a2b');R(x-3,G-50,40,12,'#7a5230');R(x-2,G-49,38,10,'#a8875a');txtC('LACUL',x+17,G-48,'#3a2414');txtC('PADURICE',x+17,G-43,'#3a2414');};

LD.sfTreime=(x)=>{const W1='#efe9dc',sd='#d8d0bd',dk='#2b2f38',dh='#4a5160',gold='#e2b23a',c=x+85;
  const cross=(cx,ty)=>{R(cx,ty,1,6,gold);R(cx-2,ty+2,5,1,gold);};
  R(x+132,G-96,18,90,W1);for(let i=0;i<3;i++)lancet(x+135+i*5,G-90,2,10,'#3a3f47');dome(x+141,G-96,9,dk,dh);cross(x+141,G-112);R(x+132,G-97,18,1,sd);
  R(x+40,G-84,94,78,W1);R(x+40,G-84,94,2,sd);for(let i=0;i<10;i++)R(x+44+i*9,G-80,4,5,'#c9a24a');
  for(let i=0;i<8;i++)lancet(x+48+i*11,G-68,3,36,'#3a3f47');
  R(x+96,G-70,34,2,sd);dome(x+113,G-70,15,dk,dh);
  R(c-22,G-100,44,16,W1);R(c-23,G-101,46,2,sd);for(let i=0;i<6;i++)lancet(c-18+i*7,G-97,3,10,'#3a3f47');
  dome(c,G-101,20,dk,dh);R(c-1,G-123,3,2,dk);cross(c,G-129);
  R(x,G-70,44,64,W1);for(let r=0;r<22;r++){const hw=Math.round(Math.sqrt(484-(22-r)*(22-r)));R(x+22-hw,G-92+r,hw*2,1,W1);}
  for(let r=0;r<17;r++){const hw=Math.round(Math.sqrt(289-(17-r)*(17-r)));R(x+22-hw,G-86+r,hw*2,1,sd);}R(x+5,G-69,34,30,sd);
  R(x+14,G-82,16,22,'#c9a24a');R(x+15,G-81,14,20,'#2c4f8a');for(let i=0;i<3;i++){R(x+17+i*4,G-76,3,3,'#f1c9a5');R(x+17+i*4,G-73,3,8,['#c0102a','#2f6fd6','#3fb36a'][i]);R(x+16+i*4,G-78,5,2,gold);}
  cross(x+22,G-99);
  R(x,G-32,134,2,sd);for(let i=0;i<10;i++){const ax=x+3+i*13;R(ax+1,G-28,6,1,'#3a3f47');R(ax,G-27,8,21,'#3a3f47');}
  R(x-2,G-6,138,2,'#d6cfbf');R(x-4,G-4,142,2,'#ccc4b2');R(x-6,G-2,146,2,'#c2baa6');
  for(const lx of[x+10,x+62,x+114])globeLamp(lx,24);};

LD.gara=(x)=>{const w=180,br='#cdb98e',bj='#b9a57a',st='#e6dcc4',rr='#b0523a',gl='#4a6278',fr='#7a5a3a';
  const bw=(bx,by,ww,hh)=>{R(bx,by,ww,hh,br);for(let r=by+2;r<by+hh;r+=3)R(bx,r,ww,1,bj);};
  const gable=(cx,top,hw,h)=>{tri(cx-hw,top,hw*2,h,br);for(let r=0;r<h;r++){const k=Math.round(hw*(r+1)/h);R(cx-k,top+r,1,1,st);R(cx+k-1,top+r,1,1,st);}};
  for(const wx of[x,x+142]){R(wx,G-48,38,8,rr);for(let i=0;i<38;i+=5)R(wx+i,G-48,1,8,shade(rr,-15));bw(wx,G-40,38,40);R(wx,G-40,38,2,st);balus(wx,G-26,38,st);
    for(const dx of[5,21])win(wx+dx,G-20,11,16,{arch:1,fr,gl});}
  for(let r=0;r<16;r++){const ins=Math.round((15-r)*0.9);R(x+60+ins,G-98+r,60-2*ins,1,rr);}
  for(const tx of[x+38,x+118]){bw(tx,G-90,24,90);R(tx,G-90,24,2,st);for(let i=2;i<24;i+=4)R(tx+i,G-88,2,3,st);
    gable(tx+12,G-112,13,22);circ(tx+12,G-100,3,st);circ(tx+12,G-100,2,gl);
    R(tx-1,G-96,3,8,st);R(tx-1,G-98,3,2,'#d8ccb0');R(tx+22,G-96,3,8,st);R(tx+22,G-98,3,2,'#d8ccb0');R(tx+11,G-115,3,3,st);
    for(let i=0;i<3;i++)R(tx+8+i*3,G-84,2,6,gl);
    R(tx+7,G-76,10,26,st);circ(tx+12,G-72,3,gl);win(tx+9,G-66,6,14,{fr,gl});balus(tx+6,G-52,12,st);win(tx+9,G-22,6,12,{fr,gl});}
  R(x+46,G-54,1,8,'#555');R(x+47,G-54,5,4,'#2b4fa8');R(x+49,G-53,1,1,'#f5c400');
  R(x+134,G-54,1,8,'#555');R(x+128,G-54,2,4,'#2b4fa8');R(x+130,G-54,2,4,'#f5c400');R(x+132,G-54,2,4,'#d7263d');
  bw(x+62,G-82,56,82);R(x+62,G-82,56,2,st);for(let i=2;i<56;i+=4)R(x+62+i,G-80,2,3,st);R(x+62,G-76,56,1,st);
  gable(x+90,G-108,14,24);R(x+89,G-112,3,4,st);
  circ(x+90,G-96,5,st);circ(x+90,G-96,4,'#f6f1e2');R(x+90,G-99,1,3,'#1b1424');R(x+90,G-96,3,1,'#1b1424');
  R(x+76,G-88,28,7,'#d8ccb0');txtC('ARAD',x+90,G-87,'#5a4a3a');
  for(let i=0;i<3;i++){const wx=x+65+i*17;win(wx,G-72,14,22,{arch:1,fr,gl});for(let k=1;k<4;k++)R(wx+1,G-68+k*5,12,1,fr);balus(wx,G-49,14,st);
    if(i===1){R(wx,G-40,14,34,'#9a4a3a');R(wx+1,G-38,12,20,gl);R(wx+1,G-16,12,10,'#8a3a2a');R(wx+7,G-16,1,10,'#5a2a1a');}else win(wx,G-40,14,34,{arch:1,fr,gl});}
  for(let r=0;r<4;r++){const hw=12-r*2;R(x+90-hw,G-44+r,hw*2,1,'#3a3f47');}R(x+79,G-41,1,6,'#3a3f47');R(x+100,G-41,1,6,'#3a3f47');
  R(x,G-6,w,6,'#a4553a');R(x,G-6,w,1,st);
  for(const lx of[x+60,x+120])globeLamp(lx,26);
  const lx=x+2;R(lx-2,G-3,48,3,'#5a4632');for(let i=0;i<48;i+=4)R(lx-2+i,G-2,2,1,'#3a2a1a');
  R(lx,G-18,26,12,'#1f2a24');R(lx+26,G-24,12,18,'#1f2a24');R(lx+28,G-22,8,6,'#c9d9cf');R(lx+4,G-24,4,6,'#1f2a24');R(lx+3,G-26,6,2,'#2f3a34');R(lx+14,G-21,5,3,'#c9a24a');
  R(lx-2,G-8,44,2,'#7a1f2f');for(const wx of[lx+2,lx+13,lx+24,lx+33])R(wx,G-10,7,7,'#2b2b33');R(lx-3,G-16,3,3,'#e0303f');};

LD.atrium=(x)=>{const tl='#d9c9b0',tj='#c9b799',dk='#2b2f36';
  R(x+168,G-78,36,64,'#4f5864');for(let i=0;i<36;i+=3)R(x+168+i,G-78,1,64,'#8a96a3');
  for(let j=0;j<4;j++){R(x+168,G-76+j*10,36,2,dk);txt(String(4-j),x+198,G-73+j*10,'#f5c400');}
  R(x+176,G-84,22,6,'#e8e2d0');R(x+176,G-82,22,2,'#f5c400');
  R(x+190,G-110,3,26,'#e8e8ec');R(x+178,G-126,28,16,'#ffffff');R(x+178,G-126,28,1,'#cfd3da');txtC('ATRIUM',x+192,G-121,'#1b1424');
  R(x,G-76,152,60,tl);for(let r=G-74;r<G-16;r+=4)for(let i=((r>>2)%2)*5;i<152;i+=10)R(x+i,r,6,1,tj);R(x,G-78,152,2,'#7d858f');
  R(x,G-76,8,60,'#23262c');
  txt('CINEMA',x+12,G-70,'#f08a1c');txt('CITY',x+16,G-63,'#f08a1c');
  R(x+42,G-72,10,56,'#5a7488');for(let j=G-72;j<G-16;j+=6)R(x+42,j,10,1,'#3a4450');R(x+47,G-72,1,56,'#3a4450');
  const sg=[['#d7263d','#1f3a6a'],['#e8e8ec','#1b1424'],['#ffffff','#9a1f2f']];sg.forEach((p,i)=>{R(x+58+i*14,G-66,11,5,p[0]);R(x+58+i*14,G-59,11,5,p[1]);});
  R(x+102,G-68,8,22,'#3fb36a');R(x+103,G-62,6,8,'#ffffff');R(x+114,G-70,7,24,dk);R(x+115,G-66,5,10,'#8a8f98');R(x+124,G-70,7,24,dk);R(x+125,G-66,5,10,'#6a7380');R(x+136,G-66,12,10,'#1b1424');
  for(let i=0;i<64;i+=4)R(x+66+i,G-86,1,8,'#8a96a3');R(x+66,G-86,64,1,'#8a96a3');txtC('ATRIUM MALL',x+98,G-84,dk);
  R(x,G-18,152,2,dk);R(x,G-16,152,16,'#3a4a58');for(let i=0;i<152;i+=12)R(x+i,G-16,1,16,dk);
  R(x+150,G-84,22,84,'#23262c');R(x+150,G-84,22,2,'#3a3f47');txtC('ATRIUM',x+161,G-60,'#ffffff');txtC('MALL',x+161,G-53,'#ffffff');
  R(x+152,G-22,18,22,'#5a7488');R(x+160,G-22,1,22,dk);R(x+152,G-32,18,8,'#16202c');txtC('10-22',x+161,G-30,'#ffd34a');
  R(x+172,G-38,32,18,'#c9a24a');for(let j=0;j<18;j+=3)for(let i=((j/3)%2);i<32;i+=3)R(x+172+i,G-38+j,1,1,'#a8862f');R(x+172,G-20,32,20,tl);R(x+176,G-16,24,16,'#3a4a58');};

LD.stadion=(x)=>{
  for(const mx of[x+16,x+184]){R(mx,G-118,2,118,'#9aa3ad');for(let j=G-116;j<G;j+=8)R(mx-1,j,4,1,'#9aa3ad');R(mx-6,G-124,14,7,'#3d434b');for(let i=0;i<4;i++)R(mx-5+i*3,G-123,2,5,'#fff8c4');}
  R(x+10,G-34,180,34,'#b9bec6');for(let i=0;i<180;i+=14){R(x+10+i,G-34,4,34,'#9aa0aa');R(x+15+i,G-26,8,26,'#5b6470');}
  for(let r=0;r<16;r++)R(x+12,G-50+r,176,1,r%3===2?'#7a1f2f':'#d7263d');R(x+12,G-35,176,1,'#ffffff');for(let i=0;i<176;i+=22)R(x+12+i,G-50,1,16,'#9aa0aa');
  for(let i=0;i<180;i++){const tp=Math.round(Math.sin(Math.PI*i/179)*8);R(x+10+i,G-66-tp,1,6,'#ffffff');R(x+10+i,G-60-tp,1,1,'#c9cdd3');}
  for(let i=0;i<180;i+=10){const tp=Math.round(Math.sin(Math.PI*i/179)*8);R(x+10+i,G-59-tp,1,9+tp,'#dfe3e8');}
  for(const tx of[x+4,x+190]){R(tx,G-64,1,64,'#e8ecf0');R(tx+5,G-64,1,64,'#e8ecf0');for(let r=0;r<64;r+=4){R(tx,G-64+r,6,1,'#e8ecf0');R(tx+((r/4)%2?5:0),G-63+r,1,3,'#e8ecf0');}}
  R(x+70,G-30,60,14,'#ffffff');txtC('UTA',x+100,G-28,'#d7263d',2);R(x+62,G-14,76,7,'#2b2f36');txtC('FRANCISC NEUMAN',x+100,G-13,'#ffffff');R(x+94,G-7,12,7,'#2b2f36');
  R(x+146,G-22,30,22,'#d7263d');R(x+148,G-16,26,16,'#f4efe4');R(x+152,G-14,6,6,'#d7263d');R(x+162,G-12,8,8,'#f4f1ec');R(x+163,G-11,6,2,'#d7263d');plate('SUVENIRURI',x+161,G-28,'#1b1424','#ffd34a');};

const DECO={
 cenad:(x)=>{const w=96,wall='#e8d2a6',tr='#fbf2de',rf='#4b5560';roofM(x+8,G-62,80,rf);R(x,G-56,w,56,wall);R(x,G-56,w,2,tr);
   for(const tx of[x+8,x+88]){R(tx-8,G-70,16,70,shade(wall,6));R(tx-8,G-70,16,2,tr);dome(tx,G-70,8,'#6fa58f','#9fd0b9');R(tx-1,G-84,2,6,'#e8c547');win(tx-3,G-64,6,12,{arch:1,fr:tr});win(tx-3,G-42,6,12,{arch:1,fr:tr});}
   R(x+44,G-66,8,4,tr);R(x+46,G-74,4,8,'#5f7d6a');R(x+47,G-77,2,3,'#6e8e7a');R(x+50,G-76,2,1,'#6e8e7a');
   for(let i=0;i<5;i++){win(x+22+i*11,G-50,6,12,{arch:1,fr:tr});win(x+22+i*11,G-32,6,11,{fr:tr});}R(x,G-36,w,2,tr);
   for(const dx of[22,66])door(x+dx,G-18,10,18,'#4a2e1c',1);R(x+38,G-17,20,8,'#2a2230');txtC('CENAD',x+48,G-15,'#ffd34a');R(x,G-4,w,4,shade(wall,-30));},
 ared:(x)=>{R(x+6,G-80,36,80,'#e8e8ec');R(x+50,G-66,40,66,'#d9dde3');for(let j=0;j<9;j++)for(let i=0;i<4;i++)R(x+9+i*8,G-76+j*8,5,5,'#5d8fb5');for(let j=0;j<7;j++){for(let i=0;i<4;i++)R(x+53+i*9,G-62+j*8,6,5,'#5d8fb5');R(x+50,G-57+j*8,40,1,'#9aa0aa');}
   for(let i=0;i<100;i+=4)R(x+i,G-16,1,16,'#2b2f36');R(x,G-16,100,1,'#2b2f36');R(x,G-9,100,1,'#2b2f36');R(x+30,G-26,40,9,'#16202c');txtC('ARED CITY',x+50,G-24,'#ffffff');},
 fotbalist:(x)=>{R(x+10,G-14,24,14,'#cfc6b6');R(x+9,G-15,26,2,'#e8e1d2');const bz='#7a6a4a',bl='#8a7a5a';R(x+18,G-24,3,9,bz);R(x+22,G-22,7,2,bz);R(x+17,G-34,8,10,bl);R(x+18,G-40,6,6,bz);R(x+15,G-33,2,7,bz);R(x+25,G-35,4,2,bz);R(x+30,G-19,4,4,'#9a8a6a');R(x+31,G-18,1,1,'#5a4a2a');}
};

export { DECO, LD, balus, circ, corin, dent, globeLamp, pedi };
