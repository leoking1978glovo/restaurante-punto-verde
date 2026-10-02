import { useEffect, useState } from "react";
import { motion } from "motion/react";

const links = [
  { label: "Menú", href: "#menu" },
  { label: "Reservas", href: "#reservas" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-ink/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-[1600px] grid-cols-3 items-center px-6 py-5 md:px-12">
        <div className="hidden gap-8 text-xs font-semibold tracking-[0.25em] text-cream uppercase md:flex">
          {links.slice(0, 2).map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#top"
          className="col-start-1 justify-self-start font-display text-2xl tracking-tight text-cream md:col-start-2 md:justify-self-center md:text-3xl"
        >
          PUNTO<span className="text-primary">VERDE</span>
        </a>

        <div className="hidden justify-end gap-8 text-xs font-semibold tracking-[0.25em] text-cream uppercase md:flex">
          {links.slice(2).map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </div>

        <div className="col-start-3 flex justify-end md:hidden">
          <a
            href="#reservas"
            className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold tracking-widest text-primary-foreground uppercase"
          >
            Reservar
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
