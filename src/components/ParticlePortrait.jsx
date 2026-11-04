import { useEffect, useRef, useState } from "react";

// Particle portrait: orange particles erupt from the bottom, assemble into your
// silhouette, then your real photo fades in. Cursor reveals a particle "scan" lens.
// Put your photo at public/images/profile/afnan.png (transparent background works best).
const PHOTO = "/images/profile/afnan.png";
const W = 360, H = 460;

function fallbackMask(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(W / 2, 150, 62, 80, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W / 2, 80, 30, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(W / 2 - 24, 210, 48, 40);
  ctx.beginPath(); ctx.ellipse(W / 2, H + 20, 170, 190, 0, Math.PI, 0); ctx.fill();
}

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
    usedPhoto = transparent > W * H * 0.1; // has real transparency
  }
  if (!usedPhoto) { ctx.clearRect(0, 0, W, H); fallbackMask(ctx); }
  const d = ctx.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3)
    if (d[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
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
      const ps = pts.map(([tx, ty]) => ({ tx, ty, x: W / 2 + (Math.random() - .5) * 40, y: H + 10,
        delay: (H - ty) / H * 90 + Math.random() * 40, vx: (Math.random() - .5) * 2, vy: -Math.random() * 3,
        r: Math.random() * 1.1 + .6, h: 10 + Math.random() * 25 }));
      let f = 0;
      const tick = () => {
        f++; ctx.clearRect(0, 0, W, H); lctx.clearRect(0, 0, W, H);
        for (const p of ps) {
          if (f < p.delay) continue;
          const t = f - p.delay;
          if (t < 25) { p.x += p.vx * 2; p.y += p.vy * 2; } // eruption burst
          else { p.x += (p.tx - p.x) * 0.07; p.y += (p.ty - p.y) * 0.07; }
          const col = `hsl(${p.h},100%,${50 + (p.ty / H) * 10}%)`;
          ctx.fillStyle = col; ctx.fillRect(p.x, p.y, p.r, p.r);
          lctx.fillStyle = col; lctx.fillRect(p.x, p.y, p.r, p.r);
        }
        raf = requestAnimationFrame(tick);
      };
      if (reduce) { ps.forEach((p) => { p.x = p.tx; p.y = p.ty; }); f = 999; }
      tick();
      timer = setTimeout(() => setReveal(true), reduce ? 0 : 4200);
    };
    img.onload = () => start(img);
    img.onerror = () => start(null);
    img.src = PHOTO;
    return () => { stop = true; cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  const move = (e) => {
    const r = wrap.current.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const lens = `radial-gradient(circle 80px at ${mouse.x}px ${mouse.y}px, #000 60%, transparent 100%)`;
  const showPhoto = photoOk && reveal;
  return (
    <div ref={wrap} onMouseMove={move} onMouseLeave={() => setMouse({ x: -999, y: -999 })}
      className="relative mx-auto" style={{ width: "min(360px,80vw)", aspectRatio: `${W}/${H}` }}>
      {photoOk && (
        <img src={PHOTO} alt="Muhammed Afnan S" className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-[1500ms]"
          style={{ opacity: showPhoto ? 1 : 0 }} />
      )}
      <canvas ref={canvas} role="img" aria-label="Particle portrait" className="absolute inset-0 w-full h-full transition-opacity duration-[1500ms]"
        style={{ opacity: showPhoto ? 0 : 1 }} />
      {/* Cursor lens: shows the particles again over the photo */}
      <canvas ref={lensCanvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: showPhoto ? 1 : 0, WebkitMaskImage: lens, maskImage: lens }} />
    </div>
  );
}
