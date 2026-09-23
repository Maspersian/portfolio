import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects, { GameShowcase, ProjectModal } from "./components/Projects";
import { About, Skills, Experience, XRShowcase, Process, Resume, Contact, Footer } from "./components/Sections";

export default function App() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <Navbar />
      <main>
        <Hero /><About /><Skills /><Experience />
        <Projects onOpen={setOpen} />
        <XRShowcase />
        <GameShowcase onOpen={setOpen} />
        <Process /><Resume /><Contact />
      </main>
      <Footer />
      {open && <ProjectModal p={open} onClose={() => setOpen(null)} />}
    </>
  );
}
