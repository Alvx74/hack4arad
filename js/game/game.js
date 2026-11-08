// Aradul Pixelat: game state, the panel under the screen (wardrobe, map,
// hints, dialogue, quiz), input, the update loop and the scene renderers.
import { C, FEET, G, H, R, RM, T, W, rng, setC, shade, tick } from './core.js';
import { norm, tw, txt, txtC } from './font.js';
import { lamp, tree } from './draw.js';
import { COST, GUIDE, drawChar, drawNPC } from './people.js';
import { DEF, OPT, ROWS, S, SHIRTS, playerLook, save } from './outfit.js';
import { LOC, LOC_TOTAL } from './locations.js';
import { DECO, LD } from './landmarks.js';
import { STREETS, palace } from './streets.js';
import { BADGE_TOTAL, INT, decorDraw } from './interiors.js';

/* ---------- state ---------- */
let cv=null,ctx=null,pctx=null;
let mode='custom',ui=null;let st=STREETS[0],curInt=null,intId=null,intFrom=null;
const player={x:40,face:1,frame:0,anim:0};let camX=0;let near=null;let fade=0,fadeCb=null;
let selRow=0,mapSel=0;
const keys={};
const $=id=>document.getElementById(id);
const panels=['pCustom','pMap','pHint','pDialog','pQuiz'];
function showPanel(id){for(const p of panels)$(p).hidden=(p!==id);}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function updHud(){const b=Object.keys(S.badges).filter(k=>LOC[k]).length,v=Object.keys(S.visited).filter(k=>LOC[k]).length;$('hudBadge').textContent=b+'/'+BADGE_TOTAL;$('hudVis').textContent=v+'/'+LOC_TOTAL;
  $('hudLoc').innerHTML='<b>'+(mode==='custom'?'Garderoba':mode==='map'?'Harta Aradului':mode==='interior'?esc(curInt.name):esc(st.name+' · '+st.route))+'</b>';}
function transition(cb){fade=0.01;fadeCb=cb;if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}

/* ---------- customize UI ---------- */
function renderCustom(){const o=S.outfit;let h='<h2>Garderoba: fă-ți personajul</h2><p class="ap-muted">Pornești chel și cu hainele de bază. Schimbă ce vrei cu săgețile (sau tastele ↑ ↓ ← →), apoi intră în oraș.</p><div class="ap-cgrid">';
  ROWS.forEach(([k,l],i)=>{const list=OPT[k];const idx=Math.max(0,list.findIndex(v=>v[0]===o[k]));h+=`<div class="ap-crow${i===selRow?' ap-sel':''}" data-row="${i}"><span class="ap-lab">${l}</span><button type="button" class="ap-arrow" data-k="${k}" data-d="-1" aria-label="${l} anterior">◀</button><span class="ap-val">${esc(list[idx][1])}</span><button type="button" class="ap-arrow" data-k="${k}" data-d="1" aria-label="${l} următor">▶</button></div>`;});
  h+='</div><div class="ap-row-end"><button type="button" class="ap-btn" id="cReset">Înapoi la chel</button><button type="button" class="ap-btn ap-gold" id="cGo">Intră în Arad (Enter)</button></div>';
  $('pCustom').innerHTML=h;
  $('pCustom').querySelectorAll('.ap-arrow').forEach(b=>b.onclick=()=>{cycle(b.dataset.k,+b.dataset.d);});
  $('pCustom').querySelectorAll('.ap-crow').forEach(r=>r.onclick=e=>{if(e.target.tagName!=='BUTTON'){selRow=+r.dataset.row;renderCustom();}});
  $('cReset').onclick=()=>{S.outfit=Object.assign({},DEF.outfit);save();renderCustom();};
  $('cGo').onclick=()=>goMap();}
function cycle(k,d){const list=OPT[k];let i=list.findIndex(v=>v[0]===S.outfit[k]);i=(i+d+list.length)%list.length;S.outfit[k]=list[i][0];selRow=ROWS.findIndex(r=>r[0]===k);save();renderCustom();}
function openCustom(){mode='custom';ui=null;showPanel('pCustom');renderCustom();updHud();}

/* ---------- map UI ---------- */
function streetLocs(s){const ids=[];for(const d of s.doors)if(!ids.includes(d.loc))ids.push(d.loc);return ids;}
function renderMap(){let h='<h2>Harta Aradului: alege un traseu</h2><div class="ap-streets">';
  STREETS.forEach((s,i)=>{const ids=streetLocs(s);const vis=ids.filter(id=>S.visited[id]).length;const bd=ids.filter(id=>S.badges[id]).length;
    h+=`<button type="button" class="ap-st${i===mapSel?' ap-sel':''}" data-i="${i}"><b>${esc(s.name)}</b><i>${esc(s.route)}</i><span>${esc(ids.map(id=>LOC[id].name).join(' · '))}</span><span class="ap-stars">Vizitate ${vis}/${ids.length} · Insigne ${bd}/${ids.length}</span></button>`;});
  const allB=Object.keys(S.badges).filter(k=>LOC[k]).length===BADGE_TOTAL;
  h+='</div>'+(allB?'<p style="color:var(--ap-gold)">Ai toate cele 20 de insigne. Oficial: Arădean Pixelat cu diplomă!</p>':'')+'<div class="ap-row-end"><button type="button" class="ap-btn" id="mCustom">Schimbă ținuta</button></div><p class="ap-note">La fiecare locație primești 3 întrebări. Cu cel puțin 2 răspunsuri corecte câștigi insigna locului. Harta e stilizată, nu la scară.</p>';
  $('pMap').innerHTML=h;$('pMap').querySelectorAll('.ap-st').forEach(b=>{b.onclick=()=>{mapSel=+b.dataset.i;enterStreet(STREETS[mapSel]);};b.onmouseenter=()=>{mapSel=+b.dataset.i;$('pMap').querySelectorAll('.ap-st').forEach(x=>x.classList.toggle('ap-sel',x===b));};});
  $('mCustom').onclick=openCustom;}
function goMap(){S.started=true;save();mode='map';ui=null;dlg=null;qz=null;showPanel('pMap');renderMap();updHud();}
function enterStreet(s){transition(()=>{st=s;mode='street';ui=null;player.x=48;player.face=1;showPanel('pHint');hintKey='';updHud();});}

/* ---------- hints ---------- */
let hintKey='';
function setHint(){let key,h;
  if(mode==='street'){if(near){key='n'+(near.npc?near.npc.def.name:near.exit?'exit':near.loc);
      if(near.npc)h=`<h2>${esc(near.npc.def.name)}</h2><p><kbd>E</kbd> Vorbește</p>`;
      else if(near.exit)h=`<h2>Indicator</h2><p><kbd>E</kbd> Înapoi la hartă</p>`;
      else{const L=LOC[near.loc];h=`<h2>${esc(L.name)}</h2><p><kbd>E</kbd> ${L.enter?'Intră înăuntru și răspunde la quiz':'Află detalii și răspunde la quiz'}${S.visited[near.loc]?' <span class="ap-muted">· vizitat</span>':''}${S.badges[near.loc]?' <span style="color:var(--ap-gold)">· insignă ★</span>':''}</p>`;}}
    else{key='s'+st.id;h=`<h2>${esc(st.name)}: ${esc(st.route)}</h2><p class="ap-muted">${esc(st.sub)}</p><p><kbd>◀</kbd><kbd>▶</kbd> sau <kbd>A</kbd><kbd>D</kbd> mergi · <kbd>Shift</kbd> fugi · <kbd>E</kbd> vorbește sau intră · <kbd>M</kbd> hartă</p>`;}}
  else if(mode==='interior'){const nI=curInt;if(near){key='i'+(near.exit?'x':'q');h=near.exit?`<h2>Ieșire</h2><p><kbd>E</kbd> Înapoi în stradă</p>`:`<h2>${esc(nI.npc.name)}</h2><p><kbd>E</kbd> ${S.badges[intId]?'Încearcă iar quiz-ul (ai deja insigna ★)':'Vorbește și răspunde la quiz'}</p>`;}
    else{key='ii'+intId;h=`<h2>${esc(nI.name)}</h2><p class="ap-muted">Uită-te prin sală, apoi mergi la ${esc(nI.npc.name.toLowerCase())} din dreapta pentru quiz. Ușa din stânga te scoate afară.</p>`;}}
  if(key!==hintKey){hintKey=key;$('pHint').innerHTML=h||'';}}

/* ---------- dialog ---------- */
let dlg=null;
const KY=['Stai... tricoul tău zice KYRIE GOAT? Respect, frate.','Kyrie goat?! Asta da ținută. Hai că-ți spun și ceva util.','Am văzut tricoul. Kyrie e goat, de acord. Acum, puțină istorie:','KYRIE GOAT? Eu țin cu UTA, dar accept.','Tricoul ăsta are mai mult stil decât tot bulevardul. Kyrie ar fi mândru.'];let kyI=0;
function kyLine(def){if(def.kind==='robot')return 'ANALIZĂ TRICOU: „KYRIE GOAT”. ADEVĂR CONFIRMAT 100%.';if(def.kind==='fish')return 'Blub... Kyrie goat. Blub blub.';if(def.kind==='ghost')return 'Buuu... nici fantomele nu contestă: Kyrie e goat.';if(def.kind==='duck')return 'Mac! Mac-Kyrie goat!';return KY[(kyI++)%KY.length];}
const COSL=['Ce costum de {n}! Arăți ca mascota oficială a Aradului.','{Art} {n} pe stradă? Am văzut de toate în Arad, dar asta e nou.','Ce costum de {n}! Stai să-ți fac o poză. Gata. Acum, ce voiai?','Frumos costum de {n}. Se potrivește perfect cu orașul.'];let coI=0;
function reactLine(look){const c=S.outfit.costum;if(c&&c!=='none'){const n=COST[c].n.toLowerCase();if(look.kind==='robot')return 'ANALIZĂ: UMAN DEGHIZAT ÎN '+COST[c].n.toUpperCase()+'. CAMUFLAJ: 3%.';const art=COST[c].art||'un';if(look.kind==='fish')return 'Blub? '+(art==='o'?'O':'Un')+' '+n+' pe uscat? Și eu sunt tot pe uscat. Blub.';return COSL[(coI++)%COSL.length].replace('{Art}',art==='o'?'O':'Un').replace('{n}',n);}if(S.outfit.shirt==='kyrie')return kyLine(look);return null;}
function say(name,look,lines,then){dlg={name,look,lines,i:0,shown:0,then};ui='dialog';showPanel('pDialog');$('dName').textContent=name;drawPortrait(look);dlgRender();}
function dlgRender(){$('dText').textContent=dlg.lines[dlg.i].slice(0,Math.floor(dlg.shown));$('dCount').textContent=(dlg.i+1)+'/'+dlg.lines.length;}
function dlgAdvance(){if(!dlg)return;const L=dlg.lines[dlg.i];if(dlg.shown<L.length){dlg.shown=L.length;dlgRender();return;}dlg.i++;dlg.shown=0;if(dlg.i>=dlg.lines.length){const t=dlg.then;dlg=null;ui=null;hintKey='';showPanel('pHint');setHint();if(t)t();return;}dlgRender();}
function drawPortrait(look){setC(pctx);pctx.clearRect(0,0,28,30);R(0,0,28,30,'#2b3b5c');R(0,22,28,8,'#24324f');drawNPC(look,14,look.kind==='banana'||look.kind==='ghost'?34:37,0,1,0);setC(ctx);}

/* ---------- quiz ---------- */
let qz=null;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startQuiz(locId,asker){const L=LOC[locId];const qs=L.quiz.map(([q,good,bad])=>{const opts=shuffle([good,...bad]);return{q,opts,ans:opts.indexOf(good),good};});
  qz={loc:locId,asker,qs,i:0,ok:0,answered:false};ui='quiz';showPanel('pQuiz');qRender();}
function qRender(){const q=qz.qs[qz.i];
  let h=`<div class="ap-qhead"><span>${esc(qz.asker)} · ${esc(LOC[qz.loc].name)}</span><span>Întrebarea ${qz.i+1}/${qz.qs.length} · Corecte ${qz.ok}</span></div><p class="ap-qtext">${esc(q.q)}</p><div class="ap-opts">`;
  q.opts.forEach((o,j)=>h+=`<button type="button" class="ap-opt" data-j="${j}"><span class="ap-k">${j+1}</span>${esc(o)}</button>`);
  h+='</div><p class="ap-fb" id="qFb"></p><div class="ap-row-end" id="qNext"></div>';$('pQuiz').innerHTML=h;
  $('pQuiz').querySelectorAll('.ap-opt').forEach(b=>b.onclick=()=>qAnswer(+b.dataset.j));}
function qAnswer(j){if(!qz||qz.answered)return;qz.answered=true;const q=qz.qs[qz.i];const good=j===q.ans;if(good)qz.ok++;
  $('pQuiz').querySelectorAll('.ap-opt').forEach((b,k)=>{b.disabled=true;if(k===q.ans)b.classList.add('ap-right');else if(k===j)b.classList.add('ap-wrong');});
  const fb=$('qFb');fb.className='ap-fb '+(good?'ap-ok':'ap-no');fb.textContent=good?['Corect! Bravo!','Exact!','Perfect, ai fost cu ochii în patru.'][qz.i%3]:'Nu chiar. Răspunsul corect: '+q.good+'.';
  const last=qz.i===qz.qs.length-1;$('qNext').innerHTML=`<button type="button" class="ap-btn ap-gold" id="qGo">${last?'Vezi rezultatul':'Următoarea'} (Enter)</button>`;$('qGo').onclick=qNext;$('qGo').focus({preventScroll:true});}
function qNext(){if(!qz||!qz.answered)return;qz.i++;qz.answered=false;if(qz.i<qz.qs.length){qRender();return;}
  const id=qz.loc,n=qz.qs.length,pass=qz.ok>=2;let h=`<h2>${pass?'Insignă câștigată: '+esc(LOC[id].name)+' ★':'Mai încearcă!'}</h2><p class="ap-qtext">Ai răspuns corect la ${qz.ok} din ${n} întrebări.</p>`;
  if(pass){const nw=!S.badges[id];S.badges[id]=1;save();updHud();const tot=Object.keys(S.badges).filter(k=>LOC[k]).length;h+=`<p class="ap-muted">${nw?'Insigna a fost adăugată în colecție.':'Insigna o aveai deja. Memorie de elefant!'} ${tot}/${BADGE_TOTAL} insigne.</p>`;}
  else h+=`<p class="ap-muted">Îți trebuie cel puțin 2 răspunsuri corecte. Mai ascultă localnicii, mai uită-te la clădire și revino.</p>`;
  h+='<div class="ap-row-end"><button type="button" class="ap-btn ap-gold" id="qDone">Închide (Enter)</button></div>';qz.done=true;$('pQuiz').innerHTML=h;$('qDone').onclick=qClose;$('qDone').focus({preventScroll:true});}
function qClose(){qz=null;ui=null;hintKey='';showPanel('pHint');setHint();}

/* ---------- interaction ---------- */
function findNear(){let best=null,bd=1e9;
  if(mode==='street'){for(const n of st.npcs){const d=Math.abs(n.x-player.x);if(d<13&&d<bd){bd=d;best={npc:n,x:n.x};}}
    for(const d0 of st.doors){const d=Math.abs(d0.x-player.x);if(d<11&&d<bd){bd=d;best={loc:d0.loc,x:d0.x};}}
    for(const e of st.exits){const d=Math.abs(e.x-player.x);if(d<12&&d<bd){bd=d;best={exit:1,x:e.x};}}}
  else if(mode==='interior'){if(player.x<40)best={exit:1,x:22};else if(Math.abs(player.x-268)<16)best={q:1,x:268};}
  return best;}
function act(){if(fade>0)return;
  if(ui==='dialog'){dlgAdvance();return;}
  if(ui==='quiz'){if(qz&&qz.done)qClose();else if(qz&&qz.answered)qNext();return;}
  if(mode==='custom'){goMap();return;}
  if(mode==='map'){enterStreet(STREETS[mapSel]);return;}
  if(!near)return;
  if(mode==='street'){
    if(near.npc){const n=near.npc,def=n.def;let lines=typeof def.lines==='function'?def.lines():def.lines.slice();{const r0=reactLine(def.look);if(r0)lines.unshift(r0);}n.face=player.x<n.x?-1:1;say(def.name,def.look,lines);return;}
    if(near.exit){goMap();return;}
    const id=near.loc,L=LOC[id];S.visited[id]=1;save();updHud();
    if(L.enter){const dx=near.x;transition(()=>{intId=L.enter;curInt=INT[L.enter];intFrom=dx;mode='interior';player.x=46;player.face=1;hintKey='';showPanel('pHint');updHud();});}
    else say('Ghidul de traseu',GUIDE,L.lines.slice(),()=>startQuiz(id,'Ghidul de traseu'));
    return;}
  if(mode==='interior'){if(near.exit){transition(()=>{mode='street';player.x=intFrom;player.face=1;hintKey='';updHud();});return;}
    const I=curInt;let lines=I.intro.slice();{const r0=reactLine(I.npc.look);if(r0)lines.unshift(r0);}const id=intId;say(I.npc.name,I.npc.look,lines,()=>startQuiz(id,I.npc.name));}
}

/* ---------- input ---------- */
const KM={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',Shift:'run'};
function onKeyDown(e){const tgt=e.target;const onBtn=tgt&&tgt.tagName==='BUTTON';
  if(KM[e.key]&&!(mode==='custom'||mode==='map')){keys[KM[e.key]]=true;if(e.key.startsWith('Arrow'))e.preventDefault();}
  if(e.repeat&&(e.key==='e'||e.key==='E'||e.key===' '||e.key==='Enter'))return;
  if(ui==='quiz'&&qz&&!qz.done&&!qz.answered&&/^[1-4]$/.test(e.key)){const j=+e.key-1;if(j<qz.qs[qz.i].opts.length)qAnswer(j);return;}
  if(mode==='custom'&&!ui){if(e.key==='ArrowUp'){selRow=(selRow+ROWS.length-1)%ROWS.length;renderCustom();e.preventDefault();return;}
    if(e.key==='ArrowDown'){selRow=(selRow+1)%ROWS.length;renderCustom();e.preventDefault();return;}
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){cycle(ROWS[selRow][0],e.key==='ArrowLeft'?-1:1);e.preventDefault();return;}}
  if(mode==='map'&&!ui){if(e.key==='ArrowUp'||e.key==='ArrowLeft'){mapSel=(mapSel+STREETS.length-1)%STREETS.length;renderMap();e.preventDefault();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){mapSel=(mapSel+1)%STREETS.length;renderMap();e.preventDefault();return;}}
  if(e.key==='e'||e.key==='E'||((e.key===' '||e.key==='Enter')&&!onBtn)){if(e.key===' ')e.preventDefault();act();return;}
  if((e.key==='m'||e.key==='M'||e.key==='Escape')&&!ui&&(mode==='street'||mode==='interior'))goMap();}
function onKeyUp(e){if(KM[e.key])keys[KM[e.key]]=false;}
function onBlur(){keys.left=keys.right=false;}
let runLatch=false;
function bindPad(root){root.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;
  const down=e=>{e.preventDefault();if(k==='act'){act();return;}if(k==='run'){runLatch=!runLatch;keys.run=runLatch;b.classList.toggle('on',runLatch);b.setAttribute('aria-pressed',String(runLatch));return;}
    if(mode==='custom'){cycle(ROWS[selRow][0],k==='left'?-1:1);return;}if(mode==='map'){mapSel=(mapSel+(k==='left'?STREETS.length-1:1))%STREETS.length;renderMap();return;}keys[k]=true;};
  const up=()=>{if(k==='left'||k==='right')keys[k]=false;};
  b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);});}

/* ---------- update ---------- */
function update(){tick();
  if(fade>0){fade+=0.07;if(fade>=2){fade=0;}else if(fade>=1&&fadeCb){const cb=fadeCb;fadeCb=null;cb();}}
  if(ui==='dialog'&&dlg){const L=dlg.lines[dlg.i];if(dlg.shown<L.length){dlg.shown=RM?L.length:Math.min(L.length,dlg.shown+1.2);dlgRender();}}
  if(mode==='street'||mode==='interior'){
    const dir=ui||fade>0?0:(keys.left?-1:0)+(keys.right?1:0);const sp=keys.run?2.4:1.3;
    if(dir){player.x+=dir*sp;player.face=dir;player.anim+=sp*0.11;player.frame=Math.floor(player.anim)&3;}else{player.frame=0;player.anim=0;}
    if(mode==='street'){player.x=Math.max(14,Math.min(st.len-14,player.x));camX=Math.max(0,Math.min(st.len-W,player.x-W/2));
      for(const n of st.npcs){if(Math.abs(n.x-player.x)<50)n.face=player.x<n.x?-1:1;n.t++;}
      if(st.tram){st.tramX+=2;if(st.tramX>st.len+400)st.tramX=-400;}}
    else{player.x=Math.max(16,Math.min(254,player.x));camX=0;}
    near=ui?null:findNear();if(!ui&&fade===0)setHint();}
}

/* ---------- render ---------- */
function drawSky(sky,par){const bh=Math.ceil(110/sky.length);sky.forEach((c,i)=>R(0,i*bh,W,bh+1,c));R(0,110,W,G-110,sky[sky.length-1]);
  for(let i=0;i<4;i++){const cx=((i*97+T*0.05-par*0.15)%(W+80)+W+80)%(W+80)-40,cy=14+i*11;R(cx,cy,26,4,'rgba(255,255,255,.75)');R(cx+5,cy-3,14,3,'rgba(255,255,255,.75)');R(cx+3,cy+4,20,1,'rgba(255,255,255,.4)');}}
function drawStreet(){drawSky(st.sky,camX);
  const hz=shade(st.sky[st.sky.length-1],-38);for(const [sx,w,h,tw2] of st.sky2){const x=Math.round(sx-camX*0.5);if(x>W||x+w<0)continue;R(x,G-50-h,w,h+50,hz);if(tw2)R(x+w/2-2,G-62-h,4,12,hz);}
  C.save();C.translate(-Math.round(camX),0);
  for(const o of st.objs){if(o.x>camX+W+30||o.x+(o.w||30)<camX-30)continue;
    if(o.kind==='f')palace(o.x,o.o);else if(o.kind==='tree')tree(o.x);else if(o.kind==='bridge')LD.bridge(o.x,o.w);else if(o.kind==='deco')DECO[o.id](o.x);else LD[o.id](o.x);}
  const x0=Math.floor(camX/8)*8;R(camX,G,W,16,'#b8b0a3');for(let x=x0;x<camX+W+8;x+=8)R(x,G,1,16,'#a39b8e');R(camX,G+7,W,1,'#a39b8e');R(camX,G+16,W,2,'#8d867b');
  R(camX,150,W,30,'#3d3b45');if(st.tram){R(camX,160,W,1,'#8d8a96');R(camX,170,W,1,'#8d8a96');}else for(let x=Math.floor(camX/24)*24;x<camX+W+24;x+=24)R(x,165,12,1,'#e8e2c8');
  for(const lx of st.lamps)if(lx>camX-10&&lx<camX+W+10)lamp(lx);
  for(const e of st.exits){R(e.x,G-22,2,22,'#5a4632');R(e.x-12,G-30,26,9,'#2a63c4');R(e.x-11,G-29,24,7,'#3a7be0');txtC('HARTA',e.x+1,G-28,'#ffffff');}
  if(st.tram){const tx=Math.round(st.tramX);if(tx>camX-120&&tx<camX+W+10){R(tx,153,110,20,'#f2e6c4');R(tx,153,110,3,'#d7263d');R(tx,168,110,4,'#d7263d');for(let i=0;i<7;i++)R(tx+5+i*15,157,10,8,'#5d8fb5');R(tx+50,145,1,8,'#2b2b33');R(tx+40,144,20,1,'#2b2b33');R(tx+8,172,6,3,'#2b2b33');R(tx+96,172,6,3,'#2b2b33');txt('ARAD',tx+80,170,'#ffffff');}}
  for(const n of st.npcs){if(n.x<camX-30||n.x>camX+W+30)continue;const d=n.def;const fr=(d.look.kind==='human'||!d.look.kind)?0:(Math.floor(n.t/30)%2);drawNPC(d.look,n.x,FEET,fr,n.face,n.t);}
  drawChar(playerLook(),player.x,FEET,player.frame,player.face);
  if(near)bubble(near.x,near.npc?FEET-36:near.exit?G-40:G-36);
  C.restore();}
function bubble(x,y){const b=Math.floor(T/12)%2;R(x-5,y-8-b,11,10,'#1b1424');R(x-4,y-7-b,9,8,'#ffc94a');txt('E',x-1,y-6-b,'#1b1424');R(x-1,y+2-b,3,1,'#1b1424');R(x,y+3-b,1,1,'#1b1424');}
function drawInterior(){const I=curInt;R(0,0,W,132,I.wall);for(let x=0;x<W;x+=16)R(x,0,1,98,shade(I.wall,-12));R(0,98,W,34,I.wall2);R(0,98,W,2,shade(I.wall2,25));R(0,0,W,6,shade(I.wall,-25));
  R(0,132,W,48,I.floor);for(let x=0;x<W;x+=16){R(x,132,1,48,I.floor2);}for(let y=140;y<180;y+=10)R(0,y,W,1,I.floor2);
  for(const d of I.decor)decorDraw(d);
  R(10,82,24,50,'#4a2e1c');R(12,84,20,48,'#6b4a2b');R(28,108,2,2,'#e8c547');R(8,72,28,9,'#2a7a3a');txtC('IESIRE',22,74,'#ffffff');
  drawNPC(I.npc.look,268,FEET+8,0,player.x<268?-1:1,T);
  drawChar(playerLook(),player.x,FEET+8,player.frame,player.face);
  if(near)bubble(near.x,near.exit?72:FEET-28);
  if(S.badges[intId]){R(282,8,30,12,'#1b1424');R(283,9,28,10,'#ffc94a');txtC('*',290,11,'#1b1424');txt('OK',294,11,'#1b1424');}}
function drawCustom(){R(0,0,W,H,'#3b2d4f');for(let x=0;x<W;x+=12)R(x,0,6,132,'#43345a');R(0,132,W,48,'#6b4a2b');for(let x=0;x<W;x+=20)R(x,132,1,48,'#5a3d22');
  R(40,30,140,4,'#c9a24a');R(52,34,116,98,'#2a2140');R(54,36,112,94,'#8fb6cf');R(56,38,24,40,'#b6d4e6');R(40,128,140,4,'#c9a24a');
  R(64,146,90,14,'#d7263d');R(66,148,86,10,'#e0505f');
  const face=Math.floor(T/120)%2?-1:1;const fr=Math.floor(T/9)&3;
  C.save();C.setTransform(4,0,0,4,0,0);drawChar(playerLook(),28,40,fr,face);C.restore();C.setTransform(1,0,0,1,0,0);
  R(190,8,124,14,'#1b1424');txtC('GARDEROBA',252,12,'#ffc94a');
  if(S.outfit.costum&&S.outfit.costum!=='none'){const L=playerLook();C.save();C.setTransform(3,0,0,3,0,0);drawChar(Object.assign({},L,{acc:{}}),84,38,0,-1);C.restore();C.setTransform(1,0,0,1,0,0);txtC('COSTUM DE '+COST[S.outfit.costum].n,250,132,'#ffffff');}
  else{teePreview(250,40);txtC(norm(OPT.shirt.find(v=>v[0]===S.outfit.shirt)[1]).replace('★','*'),250,132,'#ffffff');}}
function teePreview(cx,top){const s=SHIRTS[S.outfit.shirt];C.save();C.translate(cx,top);C.scale(2,2);
  const c=s.c;const body=(x,y,w,h,cc)=>{C.fillStyle=cc;C.fillRect(x,y,w,h);};
  body(-15,0,10,4,c);body(5,0,10,4,c);body(-20,2,8,10,c);body(12,2,8,10,c);body(-12,2,24,40,c);body(-5,0,10,2,shade(c,-30));
  if(s.pat==='dungi')for(let y=4;y<42;y+=4)body(-12,y,24,2,s.c2);
  if(s.pat==='uta'){body(-3,2,6,40,'#ffffff');body(-20,2,8,10,'#ffffff');body(12,2,8,10,'#ffffff');}
  if(s.pat==='kyrie'){body(-5,0,10,2,'#fdb927');body(-12,40,24,2,'#fdb927');body(-20,10,8,2,'#fdb927');body(12,10,8,2,'#fdb927');txt('KYRIE',-9,10,'#fdb927');txt('GOAT',-7,18,'#fdb927');body(-4,28,8,1,'#fdb927');txt('11',-3,31,'#fdb927');}
  C.restore();}
const MAPPTS={bisericaRosie:[148,72],primaria:[146,86],filarmonica:[160,96],complexMuzeal:[155,98],cazinou:[166,118],moise:[163,128],neptun:[212,110],
  avramIancu:[128,120],muzeuCalc:[124,124],teatru:[134,114],sfAnton:[138,104],biblioteca:[120,100],marionete:[116,88],reconcilierii:[94,118],
  sfTreime:[151,55],padurice:[158,44],gara:[166,30],atrium:[156,32],afi:[132,27],stadion:[110,24]};
const SP={t1:[[148,72],[146,86],[157,96],[166,118],[163,128],[190,120],[212,110]],t2:[[128,120],[134,114],[138,104],[120,100],[116,88],[100,104],[94,118]],t3:[[151,55],[158,44],[166,30],[156,32],[132,27],[108,24]]};
function drawMap(){R(0,0,W,H,'#5f8f52');const r=rng(7);for(let i=0;i<70;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);R(x,y,8+Math.floor(r()*10),6+Math.floor(r()*6),'#d8ccb4');R(x,y,8,1,'#efe6d2');}
  for(let i=0;i<14;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);R(x,y,6,6,'#3f7f3f');}
  const river=[[0,168],[60,162],[120,150],[175,138],[192,112],[204,84],[226,58],[268,40],[320,30]];for(let k=0;k<river.length-1;k++){const [a,b]=river[k],[c,d]=river[k+1];const n=40;for(let i=0;i<=n;i++){const x=a+(c-a)*i/n,y=b+(d-b)*i/n;R(x-6,y-6,12,12,'#3c78b5');}}
  for(let k=0;k<river.length-1;k++){const [a,b]=river[k],[c,d]=river[k+1];for(let i=0;i<=20;i+=4){R(a+(c-a)*i/20-2,b+(d-b)*i/20,4,1,'#7fb6e6');}}
  txt('MURES',230,62,'#cfe6fb');
  const seg=(p,fn)=>{for(let k=0;k<p.length-1;k++){const [a,b]=p[k],[cc,d]=p[k+1];const n=Math.max(Math.abs(cc-a),Math.abs(d-b));for(let i=0;i<=n;i++)fn(a+(cc-a)*i/n,b+(d-b)*i/n);}};
  STREETS.forEach(s=>seg(SP[s.id],(x,y)=>R(x-2,y-2,5,5,'#2a2230')));
  STREETS.forEach((s,i)=>{const bl=i===mapSel&&Math.floor(T/15)%2===0;seg(SP[s.id],(x,y)=>R(x-1,y-1,3,3,i===mapSel?(bl?'#ffc94a':'#ffe9a8'):'#efe6cf'));});
  for(const [id,[x,y]] of Object.entries(MAPPTS)){const b=S.badges[id],v=S.visited[id];R(x-2,y-2,5,5,'#1b1424');R(x-1,y-1,3,3,b?'#ffc94a':v?'#5fd38a':'#e0303f');}
  const labels=[['TRASEUL 1',172,82,0],['TRASEUL 2',52,106,1],['TRASEUL 3',96,10,2]];
  for(const [s,x,y,i] of labels){R(x-2,y-2,tw(s)+4,9,i===mapSel?'#ffc94a':'#1b1424');txt(s,x,y,i===mapSel?'#1b1424':'#ffffff');}
  R(4,4,92,30,'#1b1424');R(5,5,90,28,'#f4efe4');txt('ARAD',9,8,'#7a2a3a',2);txt('HARTA STILIZATA',9,24,'#5a4f3f');
  R(286,140,26,34,'#1b1424');R(287,141,24,32,'#f4efe4');txtC('N',299,144,'#1b1424');R(298,151,2,14,'#d7263d');R(297,152,4,2,'#d7263d');
  R(4,150,64,26,'#1b1424');R(6,152,3,3,'#e0303f');txt('NEVIZITAT',12,152,'#fff');R(6,159,3,3,'#5fd38a');txt('VIZITAT',12,159,'#fff');R(6,166,3,3,'#ffc94a');txt('INSIGNA',12,166,'#fff');}

function render(){setC(ctx);ctx.setTransform(1,0,0,1,0,0);
  if(mode==='street')drawStreet();else if(mode==='interior')drawInterior();else if(mode==='custom')drawCustom();else drawMap();
  if(fade>0){const a=fade<1?fade:2-fade;ctx.fillStyle='rgba(10,6,16,'+Math.min(1,a)+')';ctx.fillRect(0,0,W,H);}}

/* ---------- lifecycle ---------- */
// The game runs only while its screen is open: pause() stops the loop and the
// keyboard listeners, so the rest of the site keeps its keys.
let acc=0,last=0,raf=0,running=false;
function loop(now){acc+=Math.min(100,now-last);last=now;while(acc>=16.67){update();acc-=16.67;}render();raf=requestAnimationFrame(loop);}

export function start(root){
  cv=root.querySelector('#cv');ctx=cv.getContext('2d');pctx=root.querySelector('#portrait').getContext('2d');
  ctx.imageSmoothingEnabled=false;pctx.imageSmoothingEnabled=false;setC(ctx);
  $('pDialog').addEventListener('click',()=>dlgAdvance());
  $('btnMap').onclick=()=>goMap();
  cv.addEventListener('click',()=>{if(ui==='dialog')act();});
  bindPad(root);
  if(S.started){mode='map';showPanel('pMap');renderMap();}else{openCustom();}
  updHud();resume();
}
export function resume(){
  if(running)return;running=true;
  window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);
  acc=0;last=performance.now();raf=requestAnimationFrame(loop);
}
export function pause(){
  if(!running)return;running=false;
  window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);
  cancelAnimationFrame(raf);keys.left=keys.right=false;
}
