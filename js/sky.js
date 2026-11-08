// Login background: slowly drifting points that link up when close
// ("constellations"). Points near the pointer/finger connect to it and
// get nudged away. A few points use the coat-of-arms colours.
// Pauses when the screen is hidden; draws one still frame for reduced motion.

const ACCENTS = ['#d6ab45', '#c2504f', '#7480c4'];
const LINK = 120;        // px: max distance for a line between two points
const REACH = 170;       // px: pointer influence radius

let canvas, ctx, pts = [], raf = 0, running = false, w = 0, h = 0, dpr = 1;
const pointer = { x: -9999, y: -9999, on: false };

function resize() {
  const r = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = r.width; h = r.height;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const want = Math.max(28, Math.min(110, Math.round(w * h / 9000)));
  while (pts.length < want) pts.push(spawn());
  pts.length = want;
}

function spawn() {
  const big = Math.random() < 0.12;
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: big ? 2.6 : 1.4 + Math.random() * 0.8,
    c: big ? ACCENTS[Math.floor(Math.random() * ACCENTS.length)] : null,
  };
}

function step() {
  for (const p of pts) {
    if (pointer.on) {
      const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy);
      if (d < REACH && d > 0.1) { const f = (1 - d / REACH) * 0.06; p.vx += dx / d * f; p.vy += dy / d * f; }
    }
    p.vx *= 0.985; p.vy *= 0.985;
    // keep a little drift so the field never freezes
    if (Math.abs(p.vx) + Math.abs(p.vy) < 0.12) { p.vx += (Math.random() - 0.5) * 0.04; p.vy += (Math.random() - 0.5) * 0.04; }
    p.x += p.vx; p.y += p.vy;
    if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
  }
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.22})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (pointer.on) {
      const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (d < REACH) {
        ctx.strokeStyle = `rgba(214,171,69,${(1 - d / REACH) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
    }
  }
  for (const p of pts) {
    ctx.fillStyle = p.c || 'rgba(255,255,255,.75)';
    ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);   // square "stars": straight corners
  }
}

function loop() {
  if (!running) return;
  step(); draw();
  raf = requestAnimationFrame(loop);
}

function onMove(e) {
  const r = canvas.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
  pointer.x = t.clientX - r.left; pointer.y = t.clientY - r.top;
  pointer.on = pointer.y >= 0 && pointer.y <= r.height;
}
const onLeave = () => { pointer.on = false; };

export function startSky(el) {
  if (!el || !el.getContext) return;
  if (!canvas) {
    canvas = el; ctx = el.getContext('2d');
    window.addEventListener('resize', () => { if (running) { resize(); draw(); } });
    const host = el.parentElement;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerdown', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('touchend', onLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (running && !reduced()) raf = requestAnimationFrame(loop);
    });
  }
  if (running) return;
  running = true;
  resize();
  if (reduced()) { draw(); return; }
  raf = requestAnimationFrame(loop);
}

export function stopSky() {
  running = false;
  cancelAnimationFrame(raf);
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
