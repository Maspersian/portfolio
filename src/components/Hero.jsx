import { site } from "../data/siteConfig";
export default function Hero() {
  const links = [["LinkedIn", site.linkedin], ["GitHub", site.github], ["Email", `mailto:${site.email}`]];
  return (
    <section id="top" className="max-w-6xl mx-auto px-5 pt-32 pb-16 grid md:grid-cols-2 gap-10 items-center min-h-screen">
      <div>
        <p className="text-cyan-300 mb-3">📍 {site.location}</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight">{site.name}</h1>
        <p className="font-display text-2xl mt-3 bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">{site.title}</p>
        <p className="text-slate-300 mt-5 max-w-lg leading-relaxed">{site.intro}</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#projects" className="btn btn-primary">View My Projects</a>
          <a href={site.cv} download className="btn btn-ghost">Download CV</a>
        </div>
        <div className="flex gap-5 mt-6 text-sm text-slate-400">
          {links.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer" className="hover:text-cyan-300 underline-offset-4 hover:underline">{n}</a>)}
        </div>
      </div>
      {/* XR-inspired visual: orbiting rings around a floating cube (pure CSS, lightweight) */}
      <div className="relative h-80 md:h-[26rem] flex items-center justify-center" aria-hidden="true">
        <div className="absolute w-72 h-72 rounded-full border border-cyan-400/30 animate-[spin_30s_linear_infinite] border-dashed" />
        <div className="absolute w-52 h-52 rounded-full border border-violet-400/40 animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute w-40 h-40 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="glass w-28 h-28 flex items-center justify-center text-center font-display text-lg text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,.35)] animate-[float_5s_ease-in-out_infinite] rotate-12">Unity<br />XR</div>
        <div className="glass absolute top-8 right-4 px-3 py-2 text-xs animate-[float_6s_ease-in-out_infinite]">Meta Quest</div>
        <div className="glass absolute bottom-10 left-2 px-3 py-2 text-xs animate-[float_7s_ease-in-out_infinite]">Netcode</div>
      </div>
    </section>
  );
}
