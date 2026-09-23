import { useEffect, useState } from "react";
import { projects, categories } from "../data/projects";
import { Section, Img } from "./Section";

export function ProjectCard({ p, onOpen }) {
  return (
    <article className="glass overflow-hidden group flex flex-col hover:border-cyan-400/50 transition">
      <div className="overflow-hidden aspect-video"><Img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <span className="text-xs text-violet-300">{p.category}</span>
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
  const shots = [p.image, ...(p.images || [])];
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => (x + d + shots.length) % shots.length);
  useEffect(() => {
    const k = (e) => (e.key === "Escape" ? onClose() : e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" && go(-1));
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  });
  const Row = ({ h, children }) => <div><h4 className="text-cyan-300 text-sm font-semibold mb-1">{h}</h4><div className="text-slate-300 text-sm">{children}</div></div>;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="glass !bg-[#0b1120] max-w-3xl mx-auto my-8 p-5 md:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-4">
          <div><span className="text-xs text-violet-300">{p.category}</span><h3 className="font-display text-2xl font-bold">{p.title}</h3></div>
          <button onClick={onClose} className="btn btn-ghost !py-1 !px-3" aria-label="Close">✕</button>
        </div>
        <div className="relative mt-4 rounded-xl overflow-hidden aspect-video">
          <Img src={shots[i]} alt={`${p.title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
          {shots.length > 1 && <>
            <button onClick={() => go(-1)} className="absolute left-2 top-1/2 btn glass !p-2" aria-label="Previous">‹</button>
            <button onClick={() => go(1)} className="absolute right-2 top-1/2 btn glass !p-2" aria-label="Next">›</button>
          </>}
        </div>
        {shots.length > 1 && <div className="flex gap-2 mt-2 overflow-x-auto">{shots.map((s, n) => (
          <button key={n} onClick={() => setI(n)} className={`w-20 shrink-0 rounded overflow-hidden border ${n === i ? "border-cyan-400" : "border-transparent opacity-60"}`}><Img src={s} alt={`${p.title} thumb ${n + 1}`} className="aspect-video object-cover" /></button>
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
      <h3 className="font-display text-lg mb-4 text-cyan-300">Featured</h3>
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
