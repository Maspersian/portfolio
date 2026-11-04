import { useEffect, useState } from "react";
import { site } from "../data/siteConfig";
import ParticlePortrait from "./ParticlePortrait";

// Loading counter 0 -> 100, then the hero sequence plays.
function Loader({ onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let v = 0, t;
    const id = setInterval(() => {
      v = Math.min(v + 4, 100);
      setN(v);
      if (v >= 100) { clearInterval(id); t = setTimeout(onDone, 250); }
    }, 30);
    return () => { clearInterval(id); clearTimeout(t); };
  }, []);
  return (
    <div className="fixed inset-0 z-[60] bg-[#070b14] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-16 h-16 rounded-full border border-red-500 flex items-center justify-center text-xs font-mono">{n}</div>
    </div>
  );
}

export default function Hero() {
  const [ready, setReady] = useState(false);
  const links = [["LinkedIn", site.linkedin], ["GitHub", site.github], ["Email", `mailto:${site.email}`]];
  return (
    <section id="top" className="relative overflow-hidden min-h-screen flex flex-col justify-end">
      {!ready && <Loader onDone={() => setReady(true)} />}
      {/* Giant background word, fades from red to transparent like the reference */}
      <h1 aria-label={`${site.name} - ${site.title}`} className="absolute inset-x-0 top-[18%] text-center font-display font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: "clamp(4rem,19vw,18rem)", background: "linear-gradient(180deg,#ef2f10 10%,#7a2a1d 60%,transparent 100%)", WebkitBackgroundClip: "text", color: "transparent", letterSpacing: "-0.04em" }}>
        DEVELOPER
      </h1>
      <div className="relative z-10 max-w-6xl w-full mx-auto px-5 pt-28 grid md:grid-cols-[1fr_auto_1fr] items-end gap-6">
        <div className="pb-10 order-2 md:order-1">
          <p className="text-orange-300 mb-2">📍 {site.location}</p>
          <p className="font-display text-3xl font-bold">{site.name}</p>
          <p className="font-display text-xl text-orange-300 mt-1">{site.title}</p>
        </div>
        <div className="order-1 md:order-2 self-end">{ready && <ParticlePortrait />}</div>
        <div className="pb-10 order-3">
          <p className="text-slate-300 leading-relaxed max-w-sm">{site.intro}</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="#projects" className="btn btn-primary">View My Projects</a>
            <a href={site.cv} download className="btn btn-ghost">Download CV</a>
          </div>
          <div className="flex gap-5 mt-4 text-sm text-slate-400">
            {links.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer" className="hover:text-orange-300">{n}</a>)}
          </div>
        </div>
      </div>
    </section>
  );
}
