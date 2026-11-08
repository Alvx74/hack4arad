// Characters: the player, locals and costumed NPCs, drawn with a dark outline.
import { C, R, setC, shade } from './core.js';
import { txt } from './font.js';

/* ---------- people ---------- */
/* chibi: cap 10x9 rotunjit, corp mic, contur închis la culoare (ca la sprite-urile clasice) */
const COST={
  urs:{n:'Urs',art:'un',c:'#8a5a3a',c2:'#e8c8a0',ears:'round'},
  porc:{n:'Purcel',art:'un',c:'#f2a0b8',c2:'#ffe0ea',ears:'tri',snout:1},
  pinguin:{n:'Pinguin',art:'un',c:'#2b2f4a',c2:'#f4f1ec',beak:1},
  iepure:{n:'Iepuraș',art:'un',c:'#f4f1ec',c2:'#f9d4e0',ears:'long'},
  taur:{n:'Taur',art:'un',c:'#7a2a3a',c2:'#f0dcc0',ears:'horns'},
  vulpe:{n:'Vulpe',art:'o',c:'#e8762b',c2:'#fbefe0',ears:'tri',tail:1},
  broasca:{n:'Broască',art:'o',c:'#3f9f4a',c2:'#b8e07a',ears:'eyes'},
  caine:{n:'Cățel',art:'un',c:'#c9a06a',c2:'#f4e6cc',ears:'floppy'},
  pisica:{n:'Pisică',art:'o',c:'#8a8f9a',c2:'#e8e8ee',ears:'tri',tail:1},
  maimuta:{n:'Maimuță',art:'o',c:'#7a4a2a',c2:'#e0b88a',ears:'side'},
  rechin:{n:'Rechin',art:'un',c:'#6f8fae',c2:'#eef2f6',ears:'fin'},
  dinozaur:{n:'Dinozaur',art:'un',c:'#4caf50',c2:'#b8e07a',ears:'spikes',tail:1}
};
const OC=document.createElement('canvas');OC.width=48;OC.height=60;const OX=OC.getContext('2d');
const SCn=document.createElement('canvas');SCn.width=48;SCn.height=60;const SX=SCn.getContext('2d');
function outlined(fn,x,y){const prev=C;OX.clearRect(0,0,48,60);setC(OX);fn(24,52);setC(prev);
  SX.globalCompositeOperation='source-over';SX.clearRect(0,0,48,60);SX.drawImage(OC,0,0);
  SX.globalCompositeOperation='source-in';SX.fillStyle='#1b1424';SX.fillRect(0,0,48,60);SX.globalCompositeOperation='source-over';
  const ox=Math.round(x)-24,oy=Math.round(y)-52;
  prev.drawImage(SCn,ox-1,oy);prev.drawImage(SCn,ox+1,oy);prev.drawImage(SCn,ox,oy-1);prev.drawImage(SCn,ox,oy+1);prev.drawImage(OC,ox,oy);}
function hairDraw(x,hy,f,st,c){const d=shade(c,-25),h=shade(c,25);
  switch(st){
  case 'chel':R(f>0?x-3:x+2,hy+1,2,1,'rgba(255,255,255,.6)');break;
  case 'scurt':R(x-4,hy-1,8,1,c);R(x-5,hy,10,3,c);R(f>0?x-5:x+3,hy+3,2,3,c);R(f>0?x+2:x-4,hy+3,2,1,c);R(x-3,hy-1,3,1,h);break;
  case 'creasta':R(x-1,hy-5,3,6,c);R(x-1,hy-5,1,6,h);R(x-4,hy,8,1,d);break;
  case 'afro':R(x-6,hy-5,12,1,c);R(x-7,hy-4,14,7,c);R(x-7,hy+3,2,4,c);R(x+5,hy+3,2,4,c);R(x-5,hy-4,3,1,h);R(x+2,hy-2,1,1,d);R(x-3,hy,1,1,d);break;
  case 'lung':R(x-4,hy-1,8,1,c);R(x-5,hy,10,3,c);R(f>0?x-6:x+3,hy+1,3,12,c);R(f>0?x+2:x-4,hy+3,2,1,c);R(x-3,hy-1,3,1,h);break;
  case 'buclat':R(x-5,hy-3,2,1,c);R(x-1,hy-3,2,1,c);R(x+3,hy-3,2,1,c);R(x-6,hy-2,12,4,c);R(x-6,hy+2,1,3,c);R(x+5,hy+2,1,3,c);R(x-3,hy-1,1,1,d);R(x+1,hy,1,1,d);R(x-4,hy-2,2,1,h);break;
  case 'sapca':R(x-4,hy-3,8,1,'#d7263d');R(x-5,hy-2,10,4,'#d7263d');R(x-1,hy-2,2,2,'#ffffff');R(f>0?x+4:x-8,hy+1,4,1,'#a51b2d');R(f>0?x-5:x+3,hy+2,2,2,c);break;
  case 'coc':R(x-4,hy-1,8,1,c);R(x-5,hy,10,3,c);R(f>0?x-5:x+3,hy+3,2,2,c);R(x-2,hy-4,4,3,c);R(x-1,hy-4,1,1,h);break;
  case 'lins':R(x-4,hy-1,8,1,c);R(x-5,hy,10,3,c);R(x-1,hy+3,2,1,c);R(f>0?x-5:x+3,hy+3,2,3,c);R(x-4,hy-1,8,1,h);break;
  }}
function faceDraw(x,hy,f,sk,A){const ex=f>0?x:x-4;const eye=A.eyeC||'#1b1424';
  R(ex,hy+4,1,2,eye);R(ex+3,hy+4,1,2,eye);
  R(ex-1,hy+6,1,1,'#f0a0a0');R(ex+4,hy+6,1,1,'#f0a0a0');
  R(f>0?x+1:x-3,hy+7,2,1,A.lips||shade(sk,-50));}
function hood(x,hy,f,CO,sk,A){const hc=CO.c,dk=shade(hc,-30);
  if(CO.ears==='long'){R(x-4,hy-9,3,8,hc);R(x+1,hy-9,3,8,hc);R(x-3,hy-8,1,6,'#f2a0b8');R(x+2,hy-8,1,6,'#f2a0b8');}
  R(x-5,hy-2,10,1,hc);R(x-6,hy-1,12,10,hc);R(x-5,hy+9,10,1,hc);
  R(x-4,hy+2,8,6,sk);R(x-3,hy+8,6,1,sk);faceDraw(x,hy,f,sk,A);
  switch(CO.ears){
  case 'round':R(x-7,hy-4,3,3,hc);R(x+4,hy-4,3,3,hc);R(x-6,hy-3,1,1,CO.c2);R(x+5,hy-3,1,1,CO.c2);break;
  case 'tri':R(x-6,hy-3,3,2,hc);R(x-5,hy-4,1,1,hc);R(x+3,hy-3,3,2,hc);R(x+4,hy-4,1,1,hc);R(x-5,hy-2,1,1,CO.c2);R(x+4,hy-2,1,1,CO.c2);break;
  case 'horns':R(x-8,hy-2,2,2,'#f4f1ec');R(x-8,hy-4,1,2,'#f4f1ec');R(x+6,hy-2,2,2,'#f4f1ec');R(x+7,hy-4,1,2,'#f4f1ec');break;
  case 'eyes':R(x-5,hy-4,4,4,hc);R(x+1,hy-4,4,4,hc);R(x-4,hy-3,2,2,'#fff');R(x+2,hy-3,2,2,'#fff');R(x-3,hy-2,1,1,'#111');R(x+3,hy-2,1,1,'#111');break;
  case 'floppy':R(x-8,hy,2,7,dk);R(x+6,hy,2,7,dk);break;
  case 'side':R(x-8,hy+2,2,4,hc);R(x+6,hy+2,2,4,hc);R(x-8,hy+3,1,2,CO.c2);R(x+7,hy+3,1,2,CO.c2);break;
  case 'fin':R(x-1,hy-6,3,4,hc);R(x,hy-7,2,1,hc);break;
  case 'spikes':R(x-3,hy-4,2,2,'#f5c400');R(x+1,hy-4,2,2,'#f5c400');R(f>0?x-6:x+5,hy+1,1,2,'#f5c400');break;
  }
  if(CO.snout){R(x-1,hy,3,2,'#ff8fb0');R(x-1,hy+1,1,1,'#b85a78');R(x+1,hy+1,1,1,'#b85a78');}
  if(CO.beak)R(x-1,hy,3,1,'#f5a623');}
function drawPerson(x,y,L,fr,face){
  x=Math.round(x);y=Math.round(y);const f=face>0?1:-1;const lo=[0,1,0,-1][fr&3];const b=(fr&1)?-1:0;
  const sk=L.skin||'#e0a878',dk=shade(sk,-30),A=L.acc||{};const CO=L.costume?COST[L.costume]:null;
  const ty=y-13+b,hy=y-22+b;
  if(A.cape){R(x-6,y-15+b,12,12,A.cape);R(x-5,y-14+b,10,10,'#7d0f1e');}
  if(A.backpack&&!CO)R(f>0?x-7:x+4,ty+1,3,6,A.backpack);
  if(CO&&CO.tail){R(f>0?x-8:x+4,ty+4,4,2,CO.c);R(f>0?x-8:x+7,ty+3,1,1,CO.c2);}
  const lt=y-6;
  if(CO){const pc=CO.c;R(x-3,lt,3,2,pc);R(x,lt,3,2,pc);R(x-3+lo,lt+2,3,2,pc);R(x-lo,lt+2,3,2,pc);
    const pw=shade(pc,-30);R(x-3+lo+(f>0?0:-1),y-2,4,2,pw);R(x-lo+(f>0?0:-1),y-2,4,2,pw);}
  else{const P=L.pants||{c:'#334'};const pc=P.c;
    if(P.type==='fusta'){R(x-4,lt-1,8,1,pc);R(x-5,lt,10,3,pc);R(x-3+lo,lt+3,2,1,sk);R(x+1-lo,lt+3,2,1,sk);}
    else{const low=P.type==='scurti'?sk:pc;R(x-3,lt,3,2,pc);R(x,lt,3,2,pc);R(x-3+lo,lt+2,3,2,low);R(x-lo,lt+2,3,2,low);
      if(P.type==='trening'){R(x-3,lt,1,2,'#fff');R(x-3+lo,lt+2,1,2,'#fff');R(x+2,lt,1,2,'#fff');R(x+2-lo,lt+2,1,2,'#fff');}
      if(P.type==='blugi'){R(x-1,lt,1,1,shade(pc,30));R(x,lt+2-lo,1,1,shade(pc,25));}}
    const SH=L.shoes||{c:'#222'};
    const shoe=lx=>{const sx=lx+(f>0?0:-1);const w=SH.big?6:4;const bx=SH.big?(f>0?sx:sx-2):sx;
      if(SH.type==='slapi'){R(bx,y-2,w,2,sk);R(bx,y-1,w,1,'#2f86d6');R(bx+1,y-2,1,1,'#2f86d6');}
      else{R(bx,y-2,w,2,SH.c);R(bx,y-1,w,1,SH.c==='#f4f4f4'?'#c6c6cc':shade(SH.c,-35));}};
    shoe(x-3+lo);shoe(x-lo);}
  const S=L.shirt||{c:'#567'};const tc=CO?CO.c:S.c;
  R(x-3,ty,6,1,tc);R(x-4,ty+1,8,6,tc);
  if(CO){R(x-3,ty+2,6,4,CO.c2);const hc='#ff6fa3';R(x-2,ty+3,1,1,hc);R(x+1,ty+3,1,1,hc);R(x-2,ty+4,4,1,hc);R(x-1,ty+5,2,1,hc);}
  else{
    if(S.pat==='dungi')for(let r=1;r<7;r+=2)R(x-4,ty+r,8,1,S.c2);
    if(S.pat==='dots'){R(x-3,ty+1,1,1,S.c2);R(x+1,ty+2,1,1,S.c2);R(x-2,ty+4,1,1,S.c2);R(x+2,ty+5,1,1,S.c2);}
    if(S.pat==='uta'){R(x-1,ty,2,7,'#ffffff');}
    if(S.pat==='kyrie'){R(x-2,ty,4,1,'#fdb927');R(x-4,ty+6,8,1,'#fdb927');txt('K',x-4,ty+1,'#fdb927');txt('G',x,ty+1,'#fdb927');}
    if(S.pat==='suit'){R(x-1,ty,2,7,'#f2f2f2');R(x,ty+1,1,4,S.c2||'#c0102a');}
    if(A.vest){R(x-4,ty+1,2,6,A.vest);R(x+2,ty+1,2,6,A.vest);}
    if(A.bowtie)R(x-1,ty,2,1,'#c0102a');
    if(A.badge)R(f>0?x+1:x-3,ty+2,2,2,'#ffd34a');}
  const ac=CO?CO.c:(S.sleeve||S.c),hand=CO?shade(CO.c,-15):(A.gloves||sk);
  const la=ty+1+(lo>0?1:0),ra=ty+1+(lo<0?1:0);
  R(x-6,la,2,2,ac);R(x-6,la+2,2,2,hand);R(x+4,ra,2,2,ac);R(x+4,ra+2,2,2,hand);
  if(!CO){if(S.pat==='uta'){R(x-6,la,2,2,'#fff');R(x+4,ra,2,2,'#fff');}if(S.pat==='kyrie'){R(x-6,la+1,2,1,'#fdb927');R(x+4,ra+1,2,1,'#fdb927');}
    if(A.scarf){R(x-4,ty,8,2,'#d7263d');R(x-3,ty,1,2,'#fff');R(x+1,ty,1,2,'#fff');R(f>0?x-4:x+2,ty+2,2,4,'#d7263d');R(f>0?x-4:x+2,ty+4,2,1,'#fff');}}
  if(L.noHead)return {x,hy,f,ty};
  R(x-4,hy,8,9,sk);R(x-5,hy+1,10,7,sk);R(f>0?x-5:x+4,hy+4,1,2,dk);
  faceDraw(x,hy,f,sk,A);
  const ex=f>0?x:x-4;
  if(CO){hood(x,hy,f,CO,sk,A);}
  else{
    if(A.beard){R(x-5,hy+6,10,2,A.beard);R(x-4,hy+8,8,1,A.beard);R(x-5,hy+4,1,2,A.beard);R(x+4,hy+4,1,2,A.beard);R(f>0?x+1:x-3,hy+7,2,1,shade(A.beard,-30));}
    if(A.mustache)R(f>0?x:x-4,hy+6,4,1,A.mustache);
    hairDraw(x,hy,f,L.hair||'chel',L.hairC||'#222');
    if(A.glasses){R(ex-1,hy+3,3,1,'#222');R(ex+2,hy+3,3,1,'#222');R(ex-1,hy+4,1,1,'#222');R(ex+1,hy+4,1,1,'#222');R(ex+2,hy+4,1,1,'#222');R(ex+4,hy+4,1,1,'#222');}
    if(A.eyepatch){R(f>0?x+3:x-4,hy+4,1,2,'#111');R(f>0?x+2:x-5,hy+4,3,2,'#111');R(x-5,hy+3,10,1,'#111');}
    if(A.bandana){R(x-4,hy-2,8,1,'#c0102a');R(x-5,hy-1,10,3,'#c0102a');R(x-2,hy,1,1,'#fff');R(x+1,hy-1,1,1,'#fff');R(f>0?x-7:x+5,hy+1,2,2,'#c0102a');}
    if(A.cap){R(x-4,hy-3,8,1,A.cap);R(x-5,hy-2,10,4,A.cap);R(f>0?x+4:x-8,hy+1,4,1,shade(A.cap,-30));if(A.capBadge)R(x-1,hy-1,2,2,A.capBadge);}
    if(A.tophat){R(x-3,hy-8,6,7,'#1a1a1f');R(x-5,hy-2,10,1,'#1a1a1f');R(x-3,hy-4,6,1,'#c0102a');}
    if(A.beret){R(x-5,hy-2,10,2,'#141418');R(x-2,hy-3,4,1,'#141418');}}
  if(A.fangs)R(f>0?x+1:x-3,hy+8,1,1,'#fff');
  if(A.parrot){const px=f>0?x-8:x+5;R(px,ty-4,3,4,'#39b54a');R(f>0?px+2:px-1,ty-3,1,1,'#f5a623');R(px+1,ty-4,1,1,'#111');R(px,ty-1,1,2,'#e0303f');}
  if(A.umbrella){const ux=f>0?x+6:x-7;R(ux,y-28,1,22,'#2b2b33');R(ux-6,y-31,13,2,A.umbrella);R(ux-4,y-33,9,2,A.umbrella);R(ux-1,y-34,3,1,A.umbrella);}
  if(A.cane){const cx=f>0?x+7:x-8;R(cx,y-10,1,10,'#6b4a2b');R(f>0?cx-1:cx,y-11,2,1,'#6b4a2b');}
  if(A.cart){const cx=f>0?x+8:x-19;R(cx,y-11,11,1,'#8a96a3');R(cx,y-10,11,6,'#aab4bf');for(let i=1;i<11;i+=2)R(cx+i,y-10,1,6,'#8a96a3');R(cx+1,y-3,2,2,'#2b2b33');R(cx+8,y-3,2,2,'#2b2b33');R(f>0?cx-2:cx+11,y-12,2,3,'#8a96a3');}
  if(A.whistle)R(f>0?x+2:x-3,ty+1,1,3,'#e8e8f0');
  if(A.baton)R(f>0?x+6:x-7,ty-4,1,6,'#f4f1e6');
  if(A.book){R(f>0?x+5:x-8,ty+3,4,5,'#2f86d6');R(f>0?x+6:x-7,ty+4,2,3,'#f4f1ec');}
  if(A.pigeons){R(x-13,y-3,3,2,'#8a8fa8');R(x-11,y-4,2,1,'#6c7090');R(x-13,y-1,1,1,'#f08a1c');R(x+10,y-3,3,2,'#9ea3bb');R(x+12,y-4,2,1,'#6c7090');R(x+12,y-1,1,1,'#f08a1c');}
  return {x,hy,f,ty};
}
function drawNPCraw(d,x,y,fr,face,t){
  const f=face>0?1:-1;x=Math.round(x);
  switch(d.kind){
  case 'clown':{const o=drawPerson(x,y,{skin:'#fbf5ef',hair:'afro',hairC:'#ff4fa3',shirt:{c:'#f5d742',pat:'dots',c2:'#3a7bd5'},pants:{c:'#3a7bd5'},shoes:{c:'#e02f3a',big:1},acc:{lips:'#e0303f'}},fr,face);
    R(x-6,o.hy-4,3,2,'#4fc3ff');R(x+1,o.hy-5,3,2,'#7be05a');R(x+4,o.hy-2,2,2,'#ffd34a');R(f>0?x+3:x-5,o.hy+5,2,2,'#e0102a');R(f>0?x:x-3,o.hy+7,4,1,'#e0303f');break;}
  case 'fish':{const o=drawPerson(x,y,{skin:'#3fb6a8',shirt:{c:'#4b4f5c',pat:'suit',c2:'#f08a3c'},pants:{c:'#3b3f4a'},shoes:{c:'#111'},noHead:1},fr,face);
    const hy=o.hy;R(x-5,hy,11,9,'#3fb6a8');R(x-4,hy-1,9,1,'#3fb6a8');R(x-4,hy+6,9,2,'#bfe8d8');R(x-2,hy-4,5,3,'#f08a3c');R(x-1,hy-5,2,1,'#f08a3c');
    R(f>0?x+1:x-3,hy+2,3,3,'#fff');R(f>0?x+2:x-2,hy+3,1,1,'#111');R(f>0?x+5:x-6,hy+4,1,2,'#1b1424');R(f>0?x-2:x+1,hy+2,1,5,'#2a8a7f');
    R(f>0?x-6:x+6,hy+3,1,3,'#f08a3c');R(x-3,hy+2,1,1,'#5fd0c1');break;}
  case 'banana':{const b=(fr&1)?-1:0;R(x-3,y-4,1,3,'#333');R(x+2,y-4,1,3,'#333');R(x-4,y-2,3,2,'#d7263d');R(x+1,y-2,3,2,'#d7263d');
    for(let r=0;r<26;r++){const off=Math.round(Math.sin(r/25*Math.PI)*2)*-f;const wd=(r<2||r>23)?6:8;R(x-wd/2+off,y-30+r+b,wd,1,'#f4d03f');R(x-wd/2+off,y-30+r+b,1,1,'#d9a91c');}
    R(x-1,y-33+b,2,3,'#6b4a2b');const ex=f>0?x-1:x-3;R(ex,y-22+b,1,2,'#1b1424');R(ex+3,y-22+b,1,2,'#1b1424');R(ex,y-18+b,4,1,'#8a5a1c');R(f>0?x-7:x+5,y-16+b,3,1,'#333');R(f>0?x+5:x-7,y-15+b,3,1,'#333');break;}
  case 'robot':{const b=(fr&1)?-1:0;R(x-3,y-6,2,4,'#7d8894');R(x+1,y-6,2,4,'#7d8894');R(x-4,y-2,4,2,'#4a535d');R(x+1,y-2,4,2,'#4a535d');
    R(x-5,y-14+b,10,8,'#9aa3ad');R(x-5,y-14+b,10,1,'#c3cad2');R(x-3,y-12+b,2,2,'#ff4d6d');R(x,y-12+b,2,2,'#4dff9a');
    R(x-7,y-13+b,2,6,'#7d8894');R(x+5,y-13+b,2,6,'#7d8894');R(x-4,y-23+b,9,9,'#b8c0c8');R(x-5,y-22+b,11,7,'#b8c0c8');R(x-4,y-23+b,9,1,'#dbe1e6');
    const ex=f>0?x-1:x-3;R(ex,y-20+b,2,2,'#38e1ff');R(ex+3,y-20+b,2,2,'#38e1ff');R(x-2,y-17+b,4,1,'#5d6670');R(x,y-27+b,1,4,'#555');R(x-1,y-28+b,3,2,(Math.floor(t/20)%2)?'#ff4d6d':'#7a1f2f');break;}
  case 'alien':{const o=drawPerson(x,y,{skin:'#7ed957',shirt:{c:'#c7cdd6'},pants:{c:'#9aa3ad'},shoes:{c:'#5d6670'},noHead:1},fr,face);const hy=o.hy;
    R(x-5,hy-2,11,10,'#7ed957');R(x-4,hy-3,9,1,'#7ed957');R(x-3,hy+8,7,1,'#7ed957');const ex=f>0?x-1:x-4;R(ex,hy+2,2,3,'#111');R(ex+4,hy+2,2,3,'#111');R(ex,hy+2,1,1,'#fff');R(ex+4,hy+2,1,1,'#fff');R(f>0?x+1:x-2,hy+6,2,1,'#3b7a2a');
    R(x-3,hy-6,1,3,'#5aa33f');R(x+3,hy-6,1,3,'#5aa33f');R(x-4,hy-7,2,2,'#ff4fd8');R(x+3,hy-7,2,2,'#ff4fd8');break;}
  case 'knight':{const o=drawPerson(x,y,{skin:'#e0a878',shirt:{c:'#a9b2bc',sleeve:'#8e98a3'},pants:{c:'#8e98a3'},shoes:{c:'#6c757f'},acc:{gloves:'#8e98a3'},noHead:1},fr,face);const hy=o.hy;
    R(x-4,hy,8,9,'#b9c2cc');R(x-5,hy+1,10,7,'#b9c2cc');R(x-4,hy,8,1,'#dfe6ee');R(x-4,hy+4,8,1,'#1b1424');R(x-1,hy-4,3,4,'#d7263d');R(x-1,o.ty+2,2,4,'#d7263d');R(f>0?x+6:x-7,y-21,1,12,'#e7edf3');R(f>0?x+5:x-8,y-10,3,1,'#c9a24a');break;}
  case 'mime':{const o=drawPerson(x,y,{skin:'#fbf7f2',hair:'chel',hairC:'#111',shirt:{c:'#f4f4f4',pat:'dungi',c2:'#141418'},pants:{c:'#141418'},shoes:{c:'#141418'},acc:{gloves:'#ffffff',beret:1,lips:'#d0102a'}},fr,face);
    const ex=f>0?x:x-4;R(ex,o.hy+3,1,1,'#141418');R(ex+3,o.hy+3,1,1,'#141418');break;}
  case 'duck':{const o=drawPerson(x,y,{skin:'#f7d23e',shirt:{c:'#3a7bd5'},pants:{c:'#2f3a5a'},shoes:{c:'#f08a1c'},acc:{gloves:'#f7d23e'},noHead:1},fr,face);const hy=o.hy;
    R(x-4,hy,8,9,'#f7d23e');R(x-5,hy+1,10,7,'#f7d23e');R(f>0?x+5:x-8,hy+5,3,2,'#f08a1c');R(f>0?x+1:x-2,hy+3,1,2,'#111');R(x-1,hy-2,2,2,'#f7d23e');break;}
  case 'dino':{const b=(fr&1)?-1:0;const g='#4caf50',gd='#2f7d34';const lo=[0,1,0,-1][fr&3];
    R(f>0?x-11:x+5,y-8+b,7,3,g);
    R(x-3+lo,y-6,3,4,g);R(x-lo,y-6,3,4,g);R(x-4+lo,y-2,4,2,gd);R(x-lo,y-2,4,2,gd);
    R(x-5,y-15+b,10,10,g);R(x-3,y-13+b,6,7,'#b8e07a');for(let i=0;i<3;i++)R(f>0?x-6:x+5,y-14+i*3+b,1,2,'#f5c400');
    R(x-5,y-25+b,11,10,g);R(x-4,y-26+b,9,1,g);R(f>0?x+4:x-8,y-21+b,4,5,g);R(x-3,y-22+b,6,6,'#e0a878');const ex=f>0?x-1:x-3;R(ex,y-20+b,1,2,'#111');R(ex+3,y-20+b,1,2,'#111');R(f>0?x:x-2,y-17+b,3,1,'#a4573a');
    R(f>0?x+4:x-8,y-17+b,4,1,'#fff');R(x-2,y-28+b,2,2,'#f5c400');R(x+1,y-27+b,2,1,'#f5c400');R(f>0?x-7:x+5,y-13+b,2,2,g);R(f>0?x+5:x-7,y-13+b,2,2,g);break;}
  case 'puppet':{const o=drawPerson(x,y,{skin:'#e2b07a',hair:'scurt',hairC:'#8a4a2a',shirt:{c:'#d7263d',pat:'dots',c2:'#ffd34a'},pants:{c:'#3a7bd5'},shoes:{c:'#6b4a2b'},acc:{cap:'#3fb36a'}},fr,face);
    R(f>0?x+5:x-8,o.hy+5,3,1,'#c98a5a');R(x-6,o.ty+3,1,1,'#8a5a2b');R(x+5,o.ty+3,1,1,'#8a5a2b');R(x-2,y-6,1,1,'#8a5a2b');R(x+1,y-6,1,1,'#8a5a2b');break;}
  case 'ghost':{const fl=Math.round(Math.sin(t/18)*2);const gy=y-4+fl;
    R(x-6,gy-20,12,18,'#eef0fb');R(x-5,gy-22,10,2,'#eef0fb');R(x-3,gy-23,6,1,'#eef0fb');for(let i=0;i<6;i++)R(x-6+i*2,gy-2,1,2,'#eef0fb');R(x-6,gy-20,1,16,'#cfd3ea');
    const ex=f>0?x-1:x-4;R(ex,gy-16,2,3,'#1b1424');R(ex+4,gy-16,2,3,'#1b1424');R(f>0?x+1:x-2,gy-10,2,2,'#1b1424');R(ex-1,gy-12,1,1,'#f0a0a0');R(ex+6,gy-12,1,1,'#f0a0a0');break;}
  case 'spirit':drawSpirit(d,x,y,face,t);break;
  default:drawPerson(x,y,d,fr,face);
  }
}
function shadowAt(x,y){R(Math.round(x)-6,Math.round(y),12,1,'rgba(0,0,0,.28)');}
/* the street's patron as a ghost: pale, floating, a wisp instead of legs;
   d.body is a normal person look (pale colours), d.extra draws what drawPerson can't (hats, goggles...) */
function drawSpirit(d,x,y,face,t){const f=face>0?1:-1;const fl=Math.round(Math.sin(t/16)*2);const yy=y-5+fl;
  const o=drawPerson(x,yy,d.body,0,face);
  const wc=d.wisp||'#dfe8ff',sw=Math.round(Math.sin(t/10));
  for(let r=0;r<10;r++){const w=Math.max(2,10-r);R(x-Math.ceil(w/2)+(r>4?sw*-f:0),yy-6+r,w,1,r%3===2?shade(wc,-14):wc);}
  if(d.extra)d.extra(x,o.hy,o.ty,f);
  for(let i=0;i<3;i++){const a=t/22+i*2.1;const sx=x+Math.round(Math.cos(a)*10),sy=yy-14+Math.round(Math.sin(a*1.3)*9);if(((t>>3)+i)%3)R(sx,sy,1,1,'#ffffff');}}
function drawNPC(d,x,y,fr,face,t=0){if(d.kind==='spirit'){const a=C.globalAlpha;C.globalAlpha=0.86;outlined((lx,ly)=>drawNPCraw(d,lx,ly,fr,face,t),x,y);C.globalAlpha=a;return;}
  if(d.kind!=='ghost')shadowAt(x,y);outlined((lx,ly)=>drawNPCraw(d,lx,ly,fr,face,t),x,y);
}
function drawChar(L,x,y,fr,face){shadowAt(x,y);outlined((lx,ly)=>drawPerson(lx,ly,L,fr,face),x,y);}
function Hm(o){const d={kind:'human',skin:'#e0a878',hair:'scurt',hairC:'#3a2a20',shirt:{c:'#4a7bd0'},pants:{c:'#2f3a5a'},shoes:{c:'#222'},acc:{}};return Object.assign(d,o);}
const GUIDE=Hm({hair:'scurt',hairC:'#6b4226',shirt:{c:'#3fb36a'},pants:{c:'#2f3a5a'},acc:{cap:'#f5c400',badge:1}});

export { COST, GUIDE, Hm, drawSpirit, OC, OX, SCn, SX, drawChar, drawNPC, drawNPCraw, drawPerson, faceDraw, hairDraw, hood, outlined, shadowAt };
