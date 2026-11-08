// Small canvas confetti burst in the coat-of-arms colours.
// Skipped when the visitor asked for reduced motion.

const COLORS = ['#3c4a8f', '#b53a3c', '#d6ab45', '#4d7a4f', '#f4f1ea'];

export function confetti({ duration = 3800, count = 180 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);

  // Two bursts from the lower corners plus a light shower from the top.
  const rnd = (a, b) => a + Math.random() * (b - a);
  const parts = Array.from({ length: count }, (_, i) => {
    const side = i % 3, w = innerWidth, h = innerHeight;
    const fromTop = side === 2;
    return {
      x: fromTop ? rnd(0, w) : side ? w + 10 : -10,
      y: fromTop ? rnd(-h * 0.5, -10) : h * rnd(0.55, 0.8),
      vx: fromTop ? rnd(-1, 1) : (side ? -1 : 1) * rnd(4, 11),
      vy: fromTop ? rnd(1, 3) : rnd(-14, -7),
      r: rnd(0, Math.PI * 2), vr: rnd(-0.2, 0.2),
      w: rnd(6, 11), h: rnd(4, 7), c: COLORS[i % COLORS.length], tilt: rnd(0, Math.PI),
    };
  });
  const start = performance.now();
  function frame(t) {
    const age = t - start;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalAlpha = age > duration - 800 ? Math.max(0, (duration - age) / 800) : 1;
    for (const p of parts) {
      p.vy += 0.22; p.vx *= 0.99; p.vy = Math.min(p.vy, 6);
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.tilt += 0.1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.tilt));
      ctx.fillStyle = p.c; ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 0.5;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (age < duration) requestAnimationFrame(frame);
    else { removeEventListener('resize', size); canvas.remove(); }
  }
  requestAnimationFrame(frame);
}
