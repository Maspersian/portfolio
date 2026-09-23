import { useEffect, useRef } from "react";
export function Reveal({ children, className = "" }) {
  const ref = useRef();
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && (e.target.classList.add("in"), o.disconnect()), { threshold: 0.1 });
    o.observe(ref.current); return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
export const Section = ({ id, title, sub, children }) => (
  <section id={id} className="max-w-6xl mx-auto px-5 py-20">
    <Reveal>
      <h2 className="font-display text-3xl md:text-4xl font-bold">{title}</h2>
      {sub && <p className="text-slate-400 mt-2 max-w-2xl">{sub}</p>}
      <div className="mt-10">{children}</div>
    </Reveal>
  </section>
);
const ph = (t) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1e1b4b'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='800' height='450' fill='url(#g)'/><text x='400' y='235' fill='white' fill-opacity='.7' font-family='sans-serif' font-size='30' text-anchor='middle'>${String(t).replace(/[<>&'"]/g, "")}</text></svg>`);
// Image with lazy loading + automatic placeholder if the file is missing
export const Img = ({ src, alt, className = "" }) => (
  <img src={src} alt={alt} loading="lazy" className={className} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ph(alt); }} />
);
