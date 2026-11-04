import { site } from "../data/siteConfig";
const links = ["About", "Skills", "Experience", "Projects", "XR", "Contact"];
export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 glass !rounded-none border-x-0 border-t-0">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="font-display font-bold">{site.name}</a>
        <div className="hidden md:flex gap-6 text-sm text-slate-300">
          {links.map((l) => <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-orange-300">{l}</a>)}
        </div>
        <a href={site.cv} download className="btn btn-ghost !py-1.5 text-sm">CV</a>
      </nav>
    </header>
  );
}
