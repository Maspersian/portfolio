import { useEffect, useRef, useState } from "react";

// Particle portrait: red/orange particles erupt from the bottom and assemble into YOUR outline
// (edges glow brightest, face detail follows your photo), then your real photo fades in.
// Move the cursor over the photo to see the particle "scan" lens.
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

// Turns the photo into particle targets: edge points (bright, dense) + interior points (shaded by the photo)
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
    if (edge) pts.push({ x, y, edge: true, lum });
    else if (Math.random() < 0.12 + 0.55 * lum) pts.push({ x, y, edge: false, lum }); // brighter areas = denser dots
  }
  return pts;
}

export default function ParticlePortrait() {
  const canvas = useRef(), lensCanvas = useRef(), wrap = useRef();
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
      const ps = pts.map((p) => ({ tx: p.x, ty: p.y, edge: p.edge, x: W / 2 + (Math.random() - .5) * 50, y: H + 10,
        delay: (H - p.y) / H * 90 + Math.random() * 40, vx: (Math.random() - .5) * 2, vy: -Math.random() * 3,
        r: p.edge ? 1.5 + Math.random() * 0.8 : 1 + Math.random() * 0.8,
        hue: p.edge ? 12 + Math.random() * 20 : 4 + Math.random() * 14,
        light: p.edge ? 58 + p.lum * 12 : 38 + p.lum * 28, ph: Math.random() * 6.28 }));
      let f = 0;
      const tick = () => {
        f++; ctx.clearRect(0, 0, W, H); lctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = lctx.globalCompositeOperation = "lighter";
        for (const p of ps) {
          if (f < p.delay) continue;
          const t = f - p.delay;
          if (t < 25) { p.x += p.vx * 2; p.y += p.vy * 2; }
          else { p.x += (p.tx - p.x) * 0.07; p.y += (p.ty - p.y) * 0.07; }
          const sh = t > 80 && p.edge ? Math.sin(f * 0.05 + p.ph) * 0.8 : 0; // edge shimmer
          ctx.fillStyle = lctx.fillStyle = `hsl(${p.hue},100%,${p.light}%)`;
          ctx.fillRect(p.x + sh, p.y + sh, p.r, p.r);
          lctx.fillRect(p.x + sh, p.y + sh, p.r, p.r);
        }
        raf = requestAnimationFrame(tick);
      };
      if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; }); f = 999; }
      tick();
      timer = setTimeout(() => setReveal(true), reduce ? 0 : 4500);
    };
    img.onload = () => start(img);
    img.onerror = () => { console.warn("Portfolio photo not found:", PHOTO, "- check the file name in ParticlePortrait.jsx"); start(null); };
    img.src = PHOTO;
    return () => { stop = true; cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  const move = (e) => {
    const r = wrap.current.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) });
  };
  const lens = `radial-gradient(circle 90px at ${mouse.x}px ${mouse.y}px, #000 60%, transparent 100%)`;
  const showPhoto = photoOk && reveal;
  return (
    <div ref={wrap} onMouseMove={move} onMouseLeave={() => setMouse({ x: -999, y: -999 })}
      className="relative mx-auto" style={{ width: "min(420px,85vw)", aspectRatio: `${W}/${H}` }}>
      {photoOk && (
        <img src={PHOTO} alt="Muhammed Afnan S"
          className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-[1500ms]"
          style={{ opacity: showPhoto ? 1 : 0, filter: "drop-shadow(0 0 3px rgba(255,70,20,.9)) drop-shadow(0 0 16px rgba(255,60,20,.45))" }} />
      )}
      <canvas ref={canvas} role="img" aria-label="Particle portrait" className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms]"
        style={{ opacity: showPhoto ? 0 : 1 }} />
      <canvas ref={lensCanvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: showPhoto ? 1 : 0, WebkitMaskImage: lens, maskImage: lens }} />
    </div>
  );
}
