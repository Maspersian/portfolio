import { useEffect, useRef, useState } from "react";

// 3D particle portrait:
//  1. glowing eruption + sparks at the base, 2. particles fly up and form a 3D version of YOUR outline,
//  3. the particle cloud rotates in real 3D as you move the cursor (and sways gently by itself),
//  4. your real photo fades in, 5. cursor shows a particle "scan lens" over the photo.
//
// >>> CHANGE THIS LINE if you rename your photo (file lives in public/images/profile/) <<<
const PHOTO = "/images/profile/IMG_1699-removebg-preview.png";

const W = 400, H = 520;
const ZMAX = 50;        // how thick the 3D figure is (increase for a deeper figure)
const DEPTH_R = 60;     // how round the bulge is
const CAM = 700;        // camera distance (smaller = stronger perspective)
const PIV = H * 0.5;    // rotation pivot height

function fallbackMask(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(W / 2, 170, 68, 88, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(W / 2 - 26, 240, 52, 40);
  ctx.beginPath(); ctx.ellipse(W / 2, H + 20, 185, 210, 0, Math.PI, 0); ctx.fill();
}

// Photo -> 3D particle targets. Depth comes from the distance to the outline (a rounded bulge).
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
  const N = W * H, solidArr = new Uint8Array(N);
  for (let i = 0; i < N; i++) solidArr[i] = d[i * 4 + 3] > 128 ? 1 : 0;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && solidArr[y * W + x] === 1;

  // distance to nearest transparent pixel (two-pass chamfer); image borders are not treated as edges
  const dist = new Float32Array(N);
  for (let i = 0; i < N; i++) dist[i] = solidArr[i] ? 1e6 : 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; let v = dist[i]; if (!v) continue;
    if (x > 0) v = Math.min(v, dist[i - 1] + 1);
    if (y > 0) { v = Math.min(v, dist[i - W] + 1); if (x > 0) v = Math.min(v, dist[i - W - 1] + 1.414); if (x < W - 1) v = Math.min(v, dist[i - W + 1] + 1.414); }
    dist[i] = v;
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x; let v = dist[i]; if (!v) continue;
    if (x < W - 1) v = Math.min(v, dist[i + 1] + 1);
    if (y < H - 1) { v = Math.min(v, dist[i + W] + 1); if (x < W - 1) v = Math.min(v, dist[i + W + 1] + 1.414); if (x > 0) v = Math.min(v, dist[i + W - 1] + 1.414); }
    dist[i] = v;
  }

  const pts = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (!solid(x, y)) continue;
    const i = y * W + x;
    const edge = !solid(x - 4, y) || !solid(x + 4, y) || !solid(x, y - 4) || !solid(x, y + 4);
    const lum = usedPhoto ? (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255 : 0.5;
    const keep = edge ? 0.35 + 0.3 * lum : 0.12 + 0.55 * lum;
    if (Math.random() >= keep) continue;
    const z = ZMAX * Math.sqrt(Math.min(dist[i], DEPTH_R) / DEPTH_R);
    pts.push({ x, y, z, lum, back: false });
    if (Math.random() < 0.5) pts.push({ x, y, z: -z, lum, back: true }); // back shell so the figure has volume
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
      ctx.scale(dpr, dpr);
      const ps = pts.map((p) => ({ tx: p.x, ty: p.y, tz: p.z, back: p.back,
        x: W / 2 + (Math.random() - .5) * 50, y: H + 10, z: (Math.random() - .5) * 60,
        ox: 0, oy: 0,
        delay: (H - p.y) / H * 90 + Math.random() * 40, vx: (Math.random() - .5) * 2, vy: -Math.random() * 3, vz: (Math.random() - .5) * 2,
        r: 1 + Math.random() * 0.8, hue: 4 + Math.random() * 14, light: 44 + p.lum * 22, ph: Math.random() * 6.28 }));
      const sparks = [];
      let f = 0, angY = 0, angX = 0;
      const tick = () => {
        f++; ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";

        // eruption glow at the base
        const g = f < 20 ? f / 20 : Math.max(0, 1 - (f - 50) / 150);
        if (g > 0.01 && !reduce) {
          const gr = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 200);
          gr.addColorStop(0, `rgba(255,110,30,${0.5 * g})`); gr.addColorStop(1, "rgba(255,60,20,0)");
          ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        }
        // sparks
        if (f < 120 && !reduce) for (let k = 0; k < 5; k++)
          sparks.push({ x: W / 2 + (Math.random() - .5) * 70, y: H, vx: (Math.random() - .5) * 2.5, vy: -2 - Math.random() * 4, life: 40 + Math.random() * 40, h: 15 + Math.random() * 25 });
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.03; s.life--;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.globalAlpha = Math.min(1, s.life / 40);
          ctx.fillStyle = `hsl(${s.h},100%,60%)`; ctx.fillRect(s.x, s.y, 1.6, 1.6);
        }

        // 3D rotation: follows the cursor, sways by itself otherwise, returns to flat when the photo appears
        const m = mouseRef.current, inside = m.x > -100, revealed = revealedRef.current;
        const tY = reduce || revealed ? 0 : inside ? (m.x / W - 0.5) * 1.3 : Math.sin(f * 0.012) * 0.35;
        const tX = reduce || revealed ? 0 : inside ? -(m.y / H - 0.5) * 0.3 : 0;
        angY += (tY - angY) * 0.06; angX += (tX - angX) * 0.06;
        const cY = Math.cos(angY), sY = Math.sin(angY), cX = Math.cos(angX), sX = Math.sin(angX);
        const canRepel = !revealed && !reduce;

        for (const p of ps) {
          if (f < p.delay) continue;
          const t = f - p.delay;
          if (t < 25) { p.x += p.vx * 2; p.y += p.vy * 2; p.z += p.vz * 2; }
          else { p.x += (p.tx - p.x) * 0.07; p.y += (p.ty - p.y) * 0.07; p.z += (p.tz - p.z) * 0.07; }

          // project the 3D point to the screen
          const X = p.x - W / 2, Y = p.y - PIV, Z = p.z;
          const x1 = X * cY + Z * sY, z1 = -X * sY + Z * cY;
          const y1 = Y * cX - z1 * sX, z2 = Y * sX + z1 * cX;
          const s = CAM / (CAM - z2);
          const sx = W / 2 + x1 * s + p.ox, sy = PIV + y1 * s + p.oy;

          if (canRepel && t >= 25) {
            const dx = sx - m.x, dy = sy - m.y, d = Math.hypot(dx, dy);
            if (d < 50 && d > 0.1) { const k = (50 - d) * 0.25 / d; p.ox += dx * k; p.oy += dy * k; }
          }
          p.ox *= 0.9; p.oy *= 0.9;

          const settled = t > 60 && !reduce;
          const depthT = Math.max(0, Math.min(1, (z2 + ZMAX) / (2 * ZMAX)));
          const tw = settled ? 0.65 + 0.35 * Math.sin(f * 0.06 + p.ph) : 1;
          ctx.globalAlpha = tw * (0.4 + 0.6 * depthT) * (p.back ? 0.8 : 1); // nearer = brighter
          ctx.fillStyle = `hsl(${p.hue},100%,${p.light}%)`;
          const sz = p.r * s * (0.8 + 0.4 * depthT);
          ctx.fillRect(sx, sy, sz, sz);
        }
        ctx.globalAlpha = 1;

        // copy to the lens layer (only needed after the photo is revealed)
        if (revealed) {
          lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, lensCanvas.current.width, lensCanvas.current.height);
          lctx.drawImage(canvas.current, 0, 0);
        }
        raf = requestAnimationFrame(tick);
      };
      if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; p.z = p.tz; }); f = 999; }
      tick();
      timer = setTimeout(() => { revealedRef.current = true; setReveal(true); onReveal && onReveal(); }, reduce ? 0 : 10000);
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
  const lens = `radial-gradient(circle 90px at ${mouse.x}px ${mouse.y}px, #000 60%, transparent 100%)`;
  const showPhoto = photoOk && reveal;
  return (
    <div ref={wrap} onMouseMove={move} onMouseLeave={leave} className="relative mx-auto" style={{ width: "min(420px,85vw)", aspectRatio: `${W}/${H}` }}>
      {photoOk && (
        <img src={PHOTO} alt="Muhammed Afnan S"
          className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-[1500ms]"
          style={{ opacity: showPhoto ? 1 : 0, filter: "drop-shadow(0 0 14px rgba(255,60,20,.35))" }} />
      )}
      <canvas ref={canvas} role="img" aria-label="3D particle portrait" className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms]"
        style={{ opacity: showPhoto ? 0 : 1 }} />
      <canvas ref={lensCanvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: showPhoto ? 1 : 0, WebkitMaskImage: lens, maskImage: lens }} />
    </div>
  );
}
