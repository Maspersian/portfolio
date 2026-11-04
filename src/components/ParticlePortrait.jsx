import { useEffect, useRef, useState } from "react";

// Particle portrait (like the reference video):
//  1. glowing eruption + sparks at the base, 2. particles fly up and form YOUR outline,
//  3. particles shimmer and move away from your cursor, 4. your real photo fades in,
//  5. cursor shows a particle "scan lens" over the photo.
//
// >>> CHANGE THIS LINE if you rename your photo (file lives in public/images/profile/) <<<
const PHOTO = "/images/profile/IMG_1699-removebg-preview.png";

const W = 400, H = 520;

function fallbackMask(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(W / 2, 170, 68, 88, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(W / 2 - 26, 240, 52, 40);
  ctx.beginPath(); ctx.ellipse(W / 2, H + 20, 185, 210, 0, Math.PI, 0); ctx.fill();
}

// Photo -> particle targets. Edge and inside particles are styled identically (same brightness).
function samplePoints(img) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  let usedPhoto = false;
  if (img) {
    const s = Math.min(W / img.width, H / img.height);
    ctx.drawImage(img, (W - img.width * s) / 2, H - img.height * s, img.width * s, img.height * s);
    const a = ctx.getImageData(0, 0, W, H).data;
    let transparent = 0;
    for (let i = 3; i < a.length; i += 4) if (a[i] < 20) transparent++;
    usedPhoto = transparent > W * H * 0.1;
  }
  if (!usedPhoto) { ctx.clearRect(0, 0, W, H); fallbackMask(ctx); }
  const d = ctx.getImageData(0, 0, W, H).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 128;
  const pts = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (!solid(x, y)) continue;
    const edge = !solid(x - 4, y) || !solid(x + 4, y) || !solid(x, y - 4) || !solid(x, y + 4);
    const i = (y * W + x) * 4;
    const lum = usedPhoto ? (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255 : 0.5;
    // same density rule everywhere; edges only get a small floor so the outline stays readable
    const keep = edge ? 0.35 + 0.3 * lum : 0.12 + 0.55 * lum;
    if (Math.random() < keep) pts.push({ x, y, lum });
  }
  return pts;
}

export default function ParticlePortrait({ onReveal }) {
  const canvas = useRef(), lensCanvas = useRef(), wrap = useRef();
  const mouseRef = useRef({ x: -999, y: -999 }), revealedRef = useRef(false);
  const [photoOk, setPhotoOk] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [mouse, setMouse] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    let raf, stop = false, timer;
    const start = (image) => {
      if (stop) return;
      setPhotoOk(!!image);
      const pts = samplePoints(image);
      const ctx = canvas.current.getContext("2d");
      const lctx = lensCanvas.current.getContext("2d");
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const c of [canvas.current, lensCanvas.current]) { c.width = W * dpr; c.height = H * dpr; }
      ctx.scale(dpr, dpr); lctx.scale(dpr, dpr);
      const ps = pts.map((p) => ({ tx: p.x, ty: p.y, x: W / 2 + (Math.random() - .5) * 50, y: H + 10,
        delay: (H - p.y) / H * 90 + Math.random() * 40, vx: (Math.random() - .5) * 2, vy: -Math.random() * 3,
        r: 1 + Math.random() * 0.8, hue: 4 + Math.random() * 14, light: 44 + p.lum * 22, ph: Math.random() * 6.28 }));
      const sparks = [];
      let f = 0;
      const tick = () => {
        f++; ctx.clearRect(0, 0, W, H); lctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = lctx.globalCompositeOperation = "lighter";

        // 1) eruption glow at the base, fades out as the figure forms
        const g = f < 20 ? f / 20 : Math.max(0, 1 - (f - 50) / 150);
        if (g > 0.01 && !reduce) {
          const gr = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 200);
          gr.addColorStop(0, `rgba(255,110,30,${0.5 * g})`); gr.addColorStop(1, "rgba(255,60,20,0)");
          ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        }
        // 2) sparks flying up during the first ~2 seconds
        if (f < 120 && !reduce) for (let k = 0; k < 5; k++)
          sparks.push({ x: W / 2 + (Math.random() - .5) * 70, y: H, vx: (Math.random() - .5) * 2.5, vy: -2 - Math.random() * 4, life: 40 + Math.random() * 40, max: 80, h: 15 + Math.random() * 25 });
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.03; s.life--;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.globalAlpha = Math.min(1, s.life / 40);
          ctx.fillStyle = `hsl(${s.h},100%,60%)`; ctx.fillRect(s.x, s.y, 1.6, 1.6);
        }

        // 3) particles: assemble, then shimmer and avoid the cursor
        const m = mouseRef.current, canRepel = !revealedRef.current && !reduce;
        for (const p of ps) {
          if (f < p.delay) continue;
          const t = f - p.delay;
          if (t < 25) { p.x += p.vx * 2; p.y += p.vy * 2; }
          else {
            p.x += (p.tx - p.x) * 0.07; p.y += (p.ty - p.y) * 0.07;
            if (canRepel) {
              const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
              if (d < 50 && d > 0.1) { const k = (50 - d) * 0.25 / d; p.x += dx * k; p.y += dy * k; }
            }
          }
          const settled = t > 60 && !reduce;
          const ox = settled ? Math.sin(f * 0.03 + p.ph) * 0.7 : 0, oy = settled ? Math.cos(f * 0.027 + p.ph) * 0.7 : 0;
          const a = settled ? 0.65 + 0.35 * Math.sin(f * 0.06 + p.ph) : 1; // twinkle
          ctx.globalAlpha = lctx.globalAlpha = a;
          ctx.fillStyle = lctx.fillStyle = `hsl(${p.hue},100%,${p.light}%)`;
          ctx.fillRect(p.x + ox, p.y + oy, p.r, p.r);
          lctx.fillRect(p.x + ox, p.y + oy, p.r, p.r);
        }
        ctx.globalAlpha = lctx.globalAlpha = 1;
        raf = requestAnimationFrame(tick);
      };
      if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; }); f = 999; }
      tick();
      timer = setTimeout(() => { revealedRef.current = true; setReveal(true); onReveal && onReveal(); }, reduce ? 0 : 4500);
    };
    img.onload = () => start(img);
    img.onerror = () => { console.warn("Portfolio photo not found:", PHOTO, "- check the file name in ParticlePortrait.jsx"); start(null); };
    img.src = PHOTO;
    return () => { stop = true; cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  const move = (e) => {
    const r = wrap.current.getBoundingClientRect();
    const p = { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    mouseRef.current = p; setMouse(p);
  };
  const leave = () => { mouseRef.current = { x: -999, y: -999 }; setMouse({ x: -999, y: -999 }); };
  const inside = mouse.x > -100;
  const tilt = inside ? `perspective(900px) rotateY(${(mouse.x / W - 0.5) * 8}deg) rotateX(${-(mouse.y / H - 0.5) * 6}deg)` : "perspective(900px)";
  const lens = `radial-gradient(circle 90px at ${mouse.x}px ${mouse.y}px, #000 60%, transparent 100%)`;
  const showPhoto = photoOk && reveal;
  return (
    <div ref={wrap} onMouseMove={move} onMouseLeave={leave} className="relative mx-auto" style={{ width: "min(420px,85vw)", aspectRatio: `${W}/${H}` }}>
      <div className="absolute inset-0" style={{ transform: tilt, transition: "transform .25s ease-out" }}>
        {photoOk && (
          <img src={PHOTO} alt="Muhammed Afnan S"
            className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-[1500ms]"
            style={{ opacity: showPhoto ? 1 : 0, filter: "drop-shadow(0 0 14px rgba(255,60,20,.35))" }} />
        )}
        <canvas ref={canvas} role="img" aria-label="Particle portrait" className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms]"
          style={{ opacity: showPhoto ? 0 : 1 }} />
        <canvas ref={lensCanvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: showPhoto ? 1 : 0, WebkitMaskImage: lens, maskImage: lens }} />
      </div>
    </div>
  );
}
