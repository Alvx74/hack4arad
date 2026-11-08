// Small drawing helpers shared by the street and interior scenes.
import { G, R, shade } from './core.js';

/* ---------- draw helpers ---------- */
function win(x,y,w,h,o={}){const fr=o.fr||'#f4efe4',gl=o.gl||'#41617f';
  if(o.arch){R(x+1,y,w-2,1,fr);R(x,y+1,w,h-1,fr);R(x+2,y+1,w-4,1,gl);R(x+1,y+2,w-2,h-3,gl);}
  else{R(x,y,w,h,fr);R(x+1,y+1,w-2,h-2,gl);}
  R(x+1,y+(o.arch?2:1),1,1,'#a8cbe6');
  if(w>=5)R(x+Math.floor(w/2),y+2,1,h-3,fr);
  R(x-1,y+h,w+2,1,o.sill||shade(fr,-40));}
function lancet(x,y,w,h,c){const m=Math.ceil(w/2);for(let r=0;r<m;r++){const rw=Math.min(w,2+r*2);R(x+(w-rw)/2,y+r,rw,1,c);}R(x,y+m,w,h-m,c);}
function tri(x,y,w,h,c){for(let r=0;r<h;r++){const rw=Math.max(1,Math.round(w*(r+1)/h));R(x+(w-rw)/2,y+r,rw,1,c);}}
function dome(cx,by,r,c,hi){for(let dy=0;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r-dy*dy));R(cx-hw,by-dy,hw*2,1,c);if(hi&&hw>2)R(cx-hw+1,by-dy,Math.max(1,Math.round(hw/3)),1,hi);}}
function col(x,y,h,c){R(x,y,3,h,c);R(x+2,y,1,h,shade(c,-30));R(x-1,y,5,1,shade(c,-15));R(x-1,y+h-1,5,1,shade(c,-15));}
function door(x,y,w,h,c,arch){if(arch){R(x+1,y,w-2,1,c);R(x,y+1,w,h-1,c);}else R(x,y,w,h,c);R(x+Math.floor(w/2),y+2,1,h-2,shade(c,-25));R(x+w-3,y+Math.floor(h/2),1,1,'#e8c547');}
function bricks(x,y,w,h,c){R(x,y,w,h,c);const d=shade(c,-22);for(let r=0;r<h;r+=3){const off=(r/3)%2?2:0;for(let i=off;i<w;i+=5)R(x+i,y+r,1,1,d);R(x,y+r+2,w,1,shade(c,-10));}}
function roofM(x,y,w,c){for(let r=0;r<6;r++){const ins=5-r;R(x-1+ins,y+r,w+2-ins*2,1,r===0?shade(c,25):c);}}
function clock(cx,cy,r){dome(cx,cy+r,r,'#2a2a30');for(let dy=-r+1;dy<r;dy++){const hw=Math.round(Math.sqrt((r-1)*(r-1)-dy*dy));R(cx-hw,cy+dy,hw*2,1,'#f6f1e2');}R(cx,cy-r+2,1,r-2,'#1b1424');R(cx,cy,r-2,1,'#1b1424');}
function lamp(lx,h=28){R(lx,G-h,1,h-2,'#2c2c34');R(lx-3,G-h-2,7,2,'#2c2c34');R(lx-2,G-h,5,1,'#ffe9a8');R(lx-1,G-2,3,2,'#2c2c34');}
function lamp5(lx){const c='#3a3f47';R(lx,G-40,1,40,c);R(lx-1,G-2,3,2,c);R(lx-5,G-31,11,1,c);R(lx-2,G-35,5,1,c);
  const gl=(gx,gy)=>{R(gx-1,gy,3,3,'#fdf7dc');R(gx,gy-1,1,1,'#fdf7dc');R(gx,gy+3,1,1,'#fdf7dc');R(gx-1,gy+2,1,1,'#e3d9a8');};
  gl(lx-5,G-35);gl(lx+5,G-35);gl(lx-2,G-39);gl(lx+2,G-39);gl(lx,G-43);}
function pigeon(px,py,f){R(px,py,4,2,'#8a8fa8');R(f>0?px+3:px-1,py-1,2,2,'#6c7090');R(f>0?px+5:px-2,py,1,1,'#f08a1c');R(px+1,py+2,1,1,'#f08a1c');}
function bench(bx){R(bx,G-6,14,2,'#8a5a2b');R(bx,G-10,14,2,'#8a5a2b');R(bx+1,G-4,1,4,'#3a3f47');R(bx+12,G-4,1,4,'#3a3f47');}
function hedge(x,w){R(x,G-9,w,9,'#2f6f38');for(let i=0;i<w;i+=3)R(x+i,G-9-((i*7)%3===0?1:0),2,2,'#3f8f46');for(let i=1;i<w;i+=5)R(x+i,G-5,1,1,'#245a2c');}
function tree(x,dark){const c1=dark?'#2f6f45':'#3f8f46',c2=dark?'#4a8f5a':'#5fb35f',c0=dark?'#245a38':'#2f6f38';R(x-1,G-18,3,18,'#6b4a2b');R(x-9,G-32,18,12,c1);R(x-7,G-36,14,4,c1);R(x-5,G-38,10,2,c1);R(x-6,G-34,5,3,c2);R(x+1,G-30,4,2,c2);R(x-9,G-22,18,2,c0);}

export { bench, bricks, clock, col, dome, door, hedge, lamp, lamp5, lancet, pigeon, roofM, tree, tri, win };
