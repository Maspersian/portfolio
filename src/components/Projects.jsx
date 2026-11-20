import { useEffect, useRef, useState } from "react";
import { projects, categories } from "../data/projects";
import { Section, Img } from "./Section";

// Local videos: use `videos: [..]` (several) or the older single `video: ".."`
const vids = (p) => (p.videos && p.videos.length ? p.videos : p.video ? [p.video] : []);
const ytId = (u = "") => { const m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };

// Blurred copy of the image behind the real one, so phone-shaped (portrait) media never gets cropped
function Backdrop({ src }) {
  return <img src={src} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60"
    onError={(e) => { e.currentTarget.style.display = "none"; }} />;
}

// Card thumbnail: always shows the cover image. If the project has a video, the video fades in
// and plays while the cursor is on the card, and goes back to the cover image when the cursor leaves.
// (Phones have no hover, so there the video plays muted while the card is on screen.)
function CardThumb({ p }) {
  const v = useRef();
  const [on, setOn] = useState(false);
  const first = vids(p)[0];
  const touch = typeof matchMedia !== "undefined" && matchMedia("(hover: none)").matches;
  const start = () => { const el = v.current; if (el) el.play().then(() => setOn(true)).catch(() => {}); };
  const stop = () => { const el = v.current; if (el) { el.pause(); el.currentTime = 0; } setOn(false); };
  useEffect(() => {
    const el = v.current;
    if (!first || !el || !touch) return;
    const o = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.6 });
    o.observe(el); return () => o.disconnect();
  }, [first, touch]);
  return (
    <div className="absolute inset-0" onMouseEnter={first ? start : undefined} onMouseLeave={first ? stop : undefined}>
      <Backdrop src={p.image} />
      <Img src={p.image} alt={p.title} className="relative w-full h-full object-contain group-hover:scale-105 transition duration-500" />
      {first && (
        <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: on ? 1 : 0 }}>
          <Backdrop src={p.image} />
          <video ref={v} src={first} muted loop playsInline preload="metadata" className="relative w-full h-full object-contain" />
        </div>
      )}
      {(first || ytId(p.youtube)) && <span className="chip absolute top-2 right-2 z-10 !bg-black/70">▶ Video</span>}
    </div>
  );
}

export function ProjectCard({ p, onOpen }) {
  return (
    <article className="glass overflow-hidden group flex flex-col hover:border-orange-500/50 transition">
      <div className="overflow-hidden aspect-video relative"><CardThumb p={p} /></div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <span className="text-xs text-amber-300">{p.category}</span>
        <h3 className="font-display text-xl font-bold">{p.title}</h3>
        <p className="text-sm text-slate-400">{p.description}</p>
        <div className="flex flex-wrap gap-1.5">{p.technologies.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        <p className="text-xs text-slate-500">Platform: {p.platform}</p>
        <div className="flex gap-2 mt-auto pt-2">
          <button onClick={() => onOpen(p)} className="btn btn-primary !py-1.5 text-sm">View Details</button>
          {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-ghost !py-1.5 text-sm">Demo</a>}
          {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost !py-1.5 text-sm">GitHub</a>}
        </div>
      </div>
    </article>
  );
}

export function ProjectModal({ p, onClose }) {
  // Slider order: local video, YouTube video, then cover image + screenshots
  const media = [
    ...vids(p).map((src) => ({ t: "video", src })),
    ...(ytId(p.youtube) ? [{ t: "yt", id: ytId(p.youtube) }] : []),
    ...[p.image, ...(p.images || [])].map((src) => ({ t: "img", src })),
  ];
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => (x + d + media.length) % media.length);
  useEffect(() => {
    const k = (e) => (e.key === "Escape" ? onClose() : e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" && go(-1));
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  });
  const m = media[i];
  const Row = ({ h, children }) => <div><h4 className="text-orange-300 text-sm font-semibold mb-1">{h}</h4><div className="text-slate-300 text-sm">{children}</div></div>;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="glass !bg-[#140e0b] max-w-3xl mx-auto my-8 p-5 md:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-4">
          <div><span className="text-xs text-amber-300">{p.category}</span><h3 className="font-display text-2xl font-bold">{p.title}</h3></div>
          <button onClick={onClose} className="btn btn-ghost !py-1 !px-3" aria-label="Close">✕</button>
        </div>
        <div className="relative mt-4 rounded-xl overflow-hidden h-[min(70vh,560px)] bg-black">
          {m.t === "img" && <><Backdrop src={m.src} /><Img src={m.src} alt={`${p.title} screenshot ${i + 1}`} className="relative w-full h-full object-contain" /></>}
          {m.t === "video" && <><Backdrop src={p.image} /><video key={i} src={m.src} poster={p.image} controls autoPlay muted playsInline className="relative w-full h-full object-contain" /></>}
          {m.t === "yt" && <iframe key={i} src={`https://www.youtube-nocookie.com/embed/${m.id}`} title={`${p.title} video`} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="relative w-full h-full" />}
          {media.length > 1 && <>
            <button onClick={() => go(-1)} className="absolute left-2 top-1/2 z-10 btn glass !p-2" aria-label="Previous">‹</button>
            <button onClick={() => go(1)} className="absolute right-2 top-1/2 z-10 btn glass !p-2" aria-label="Next">›</button>
          </>}
        </div>
        {media.length > 1 && <div className="flex gap-2 mt-2 overflow-x-auto">{media.map((x, n) => (
          <button key={n} onClick={() => setI(n)} className={`relative w-16 shrink-0 rounded overflow-hidden border ${n === i ? "border-orange-500" : "border-transparent opacity-60"}`}>
            <Img src={x.t === "img" ? x.src : p.image} alt={`${p.title} thumb ${n + 1}`} className="aspect-square w-full object-cover" />
            {x.t !== "img" && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">▶</span>}
          </button>
        ))}</div>}
        <div className="grid gap-4 mt-5">
          <p className="text-slate-300">{p.description}</p>
          <Row h="My role">{p.role}</Row>
          <Row h="My contribution">{p.contribution}</Row>
          <Row h="Features"><ul className="list-disc ml-5">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></Row>
          <Row h="Development challenges">{p.challenges}</Row>
          <Row h="Platform">{p.platform}</Row>
          <div className="flex flex-wrap gap-1.5">{p.technologies.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <div className="flex gap-2">
            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-primary">Demo</a>}
            {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ onOpen }) {
  const [cat, setCat] = useState("All");
  const featured = projects.filter((p) => p.featured);
  const list = projects.filter((p) => cat === "All" || p.category === cat);
  return (
    <Section id="projects" title="Projects" sub="Featured work first, then everything filtered by category.">
      <h3 className="font-display text-lg mb-4 text-orange-300">Featured</h3>
      <div className="grid md:grid-cols-2 gap-5 mb-14">{featured.map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpen} />)}</div>
      <div className="flex flex-wrap gap-2 mb-6">{categories.map((c) => (
        <button key={c} onClick={() => setCat(c)} className={`btn !py-1.5 text-sm ${cat === c ? "btn-primary" : "btn-ghost"}`}>{c}</button>))}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{list.map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpen} />)}</div>
    </Section>
  );
}

export function GameShowcase({ onOpen }) {
  const tags = ["Unity", "C#", "Gameplay Programming", "Multiplayer", "UI", "Physics", "Animation", "API Integration"];
  return (
    <Section id="games" title="Game Development" sub="Gameplay systems, multiplayer and polished UI across 2D, 3D and 2.5D.">
      <div className="flex flex-wrap gap-2 mb-6">{tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{projects.filter((p) => ["Games", "Multiplayer"].includes(p.category)).map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpen} />)}</div>
    </Section>
  );
}
