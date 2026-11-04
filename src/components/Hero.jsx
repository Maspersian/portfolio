import { useEffect, useState } from "react";
import { site } from "../data/siteConfig";
import ParticlePortrait from "./ParticlePortrait";

// Loading ring 0 -> 100, then it fades out and the hero sequence starts.
function Loader({ onStart, onGone }) {
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    let v = 0, t1, t2;
    const id = setInterval(() => {
      v = Math.min(v + 2, 100); setN(v);
      if (v >= 100) {
        clearInterval(id);
        t1 = setTimeout(() => { setLeaving(true); onStart(); t2 = setTimeout(onGone, 600); }, 250);
      }
    }, 25);
    return () => { clearInterval(id); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const C = 2 * Math.PI * 30;
  return (
    <div className={`fixed inset-0 z-[60] bg-[#070b14] flex items-center justify-center transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`} role="status" aria-label="Loading">
      <div className="relative w-16 h-16 flex items-center justify-center text-xs font-mono">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="30" fill="none" stroke="#ef2f10" strokeWidth="1.5" strokeDasharray={C} strokeDashoffset={C * (1 - n / 100)} />
        </svg>
        {n}
      </div>
    </div>
  );
}

const bigText = { fontSize: "clamp(4rem,19vw,18rem)", letterSpacing: "-0.04em", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

export default function Hero() {
  const [ready, setReady] = useState(false);     // loader finished fading -> start animation
  const [gone, setGone] = useState(false);       // loader removed
  const [revealed, setRevealed] = useState(false); // photo revealed -> text turns red
  const links = [["LinkedIn", site.linkedin], ["GitHub", site.github], ["Email", `mailto:${site.email}`]];
  return (
    <section id="top" className="relative overflow-hidden min-h-screen flex flex-col justify-end">
      {!gone && <Loader onStart={() => setReady(true)} onGone={() => setGone(true)} />}

      {/* Giant word: starts grey while particles form, turns red when the photo appears (like the video) */}
      <div className="absolute inset-x-0 top-[18%] text-center font-display font-bold leading-none select-none pointer-events-none"
        style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(24px)", transition: "opacity 1.6s ease, transform 1.6s ease" }}>
        <h1 aria-label={`${site.name} - ${site.title}`}
          style={{ ...bigText, backgroundImage: "linear-gradient(180deg,#bdb2a0 5%,#6b6257 55%,transparent 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", opacity: revealed ? 0 : 0.6, transition: "opacity 1.5s ease" }}>
          DEVELOPER
        </h1>
        <div aria-hidden="true" className="absolute inset-0"
          style={{ ...bigText, backgroundImage: "linear-gradient(180deg,#ef2f10 10%,#7a2a1d 60%,transparent 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", opacity: revealed ? 1 : 0, transition: "opacity 1.5s ease" }}>
          DEVELOPER
        </div>
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-5 pt-28 grid md:grid-cols-[1fr_auto_1fr] items-end gap-6">
        <div className="pb-10 order-2 md:order-1">
          <p className="text-orange-300 mb-2">📍 {site.location}</p>
          <p className="font-display text-3xl font-bold">{site.name}</p>
          <p className="font-display text-xl text-orange-300 mt-1">{site.title}</p>
        </div>
        <div className="order-1 md:order-2 self-end">{ready && <ParticlePortrait onReveal={() => setRevealed(true)} />}</div>
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
