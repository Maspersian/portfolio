import { useState } from "react";
import { site } from "../data/siteConfig";
import { Section } from "./Section";

export const About = () => (
  <Section id="about" title="About me">
    <div className="max-w-2xl space-y-4 text-slate-300 leading-relaxed">{site.about.map((t) => <p key={t}>{t}</p>)}</div>
  </Section>
);

export const Skills = () => (
  <Section id="skills" title="Technical skills">
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Object.entries(site.skills).map(([g, items]) => (
        <div key={g} className="glass p-5 hover:border-cyan-400/40 transition">
          <h3 className="font-display font-bold mb-3">{g}</h3>
          <div className="flex flex-wrap gap-2">{items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </div>))}
    </div>
  </Section>
);

export const Experience = () => (
  <Section id="experience" title="Experience">
    <ol className="border-l border-cyan-400/30 ml-2 space-y-8">
      {site.experience.map((e) => (
        <li key={e.company} className="pl-6 relative">
          <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <p className="text-xs text-violet-300">{e.period}</p>
          <h3 className="font-display text-xl font-bold">{e.role}</h3>
          <p className="text-cyan-300 text-sm mb-2">{e.company}</p>
          <ul className="list-disc ml-5 text-slate-300 text-sm space-y-1">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </li>))}
    </ol>
  </Section>
);

const Flow = ({ steps }) => (
  <ol className="flex flex-wrap items-center gap-3">
    {steps.map((s, i) => (
      <li key={s} className="flex items-center gap-3">
        <span className="glass px-4 py-2 text-sm">{s}</span>
        {i < steps.length - 1 && <span className="text-cyan-400" aria-hidden="true">›</span>}
      </li>))}
  </ol>
);

export const XRShowcase = () => (
  <section id="xr" className="py-20 bg-gradient-to-b from-transparent via-violet-950/30 to-transparent">
    <div className="max-w-6xl mx-auto px-5">
      <h2 className="font-display text-3xl md:text-4xl font-bold">XR / Mixed Reality Development</h2>
      <p className="text-slate-400 mt-2 max-w-2xl">Educational, interactive and multiplayer experiences for Meta Quest.</p>
      <div className="flex flex-wrap gap-2 my-6">{["Meta Quest", "Mixed Reality", "Interactive 3D Objects", "Educational XR Activities", "Multiplayer XR", "Unity", "Netcode"].map((t) => <span key={t} className="chip">{t}</span>)}</div>
      <Flow steps={site.xrFlow} />
    </div>
  </section>
);

export const Process = () => (
  <Section id="process" title="Development process">
    <Flow steps={site.process} />
  </Section>
);

export const Resume = () => (
  <Section id="resume" title="Interested in working together?" sub="Download my CV to learn more about my experience and technical skills.">
    <a href={site.cv} download className="btn btn-primary">Download CV</a>
  </Section>
);

export function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // Opens the visitor's mail app. To use a real form backend, see README.
  const submit = (e) => {
    e.preventDefault();
    location.href = `mailto:${site.email}?subject=${encodeURIComponent("Portfolio message from " + f.name)}&body=${encodeURIComponent(f.message + "\n\n" + f.name + " (" + f.email + ")")}`;
  };
  const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-cyan-400 outline-none";
  return (
    <Section id="contact" title="Let's build something interactive" sub="Available for Unity Developer / XR Developer opportunities">
      <div className="grid md:grid-cols-2 gap-10">
        <ul className="space-y-3 text-slate-300">
          <li>✉️ <a className="hover:text-cyan-300" href={`mailto:${site.email}`}>{site.email}</a></li>
          <li>💼 <a className="hover:text-cyan-300" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
          <li>💻 <a className="hover:text-cyan-300" href={site.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li>📍 {site.location}</li>
        </ul>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" value={f.name} onChange={set("name")} className={inp} aria-label="Name" />
          <input required type="email" placeholder="Email" value={f.email} onChange={set("email")} className={inp} aria-label="Email" />
          <textarea required rows="4" placeholder="Message" value={f.message} onChange={set("message")} className={inp} aria-label="Message" />
          <button className="btn btn-primary">Send Message</button>
        </form>
      </div>
    </Section>
  );
}

export const Footer = () => (
  <footer className="border-t border-white/10 py-10 text-center text-sm text-slate-400">
    <p className="font-display text-white text-lg">{site.name}</p>
    <p>{site.title}</p><p>{site.location}</p>
    <p className="mt-2 space-x-3">
      <a href={site.linkedin} className="hover:text-cyan-300">LinkedIn</a><a href={site.github} className="hover:text-cyan-300">GitHub</a><a href={`mailto:${site.email}`} className="hover:text-cyan-300">Email</a>
    </p>
    <p className="mt-3">© 2026 {site.name}</p>
  </footer>
);
