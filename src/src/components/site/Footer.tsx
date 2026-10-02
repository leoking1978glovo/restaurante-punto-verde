import type { FormEvent } from "react";
import { toast } from "sonner";

const hours = [
  ["Lunes – Jueves", "13:00 – 16:30 · 20:00 – 23:30"],
  ["Viernes – Sábado", "13:00 – 17:00 · 20:00 – 01:00"],
  ["Domingo", "13:00 – 17:00"],
];

const socials = ["Instagram", "TikTok", "X"];

export function Footer() {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("¡Bienvenido a la lista!", { description: "Te avisamos de cada nueva carta." });
  };

  return (
    <footer id="contacto" className="bg-ink pt-24 pb-10">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <h2 className="text-[clamp(2.5rem,10vw,8rem)] text-cream/10">PUNTO VERDE</h2>

        <div className="mt-12 grid gap-12 border-t border-cream/15 pt-12 md:grid-cols-4">
          <div>
            <h3 className="text-sm tracking-[0.3em] text-primary uppercase">Dónde</h3>
            <p className="mt-4 leading-relaxed text-cream/70">
              Calle del Carbón 14
              <br />
              28012 Madrid
              <br />
              España
            </p>
            <p className="mt-4 text-cream/70">+34 910 22 44 88</p>
            <p className="text-cream/70">hola@punto-verde.es</p>
          </div>

          <div>
            <h3 className="text-sm tracking-[0.3em] text-primary uppercase">Horarios</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              {hours.map(([d, h]) => (
                <li key={d}>
                  <span className="block font-semibold text-cream">{d}</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm tracking-[0.3em] text-primary uppercase">Newsletter</h3>
            <p className="mt-4 text-sm text-cream/70">
              Cartas nuevas, eventos y platos fuera de menú. Sin spam.
            </p>
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                required
                type="email"
                placeholder="tu@email.com"
                className="flex-1 rounded-full border-2 border-cream/20 bg-transparent px-5 py-3 text-cream placeholder:text-cream/40 outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-full bg-secondary px-8 py-3 font-display tracking-tight text-ink uppercase"
              >
                Apuntarme
              </button>
            </form>
            <div className="mt-8 flex gap-6 text-xs tracking-[0.25em] text-cream/60 uppercase">
              {socials.map((s) => (
                <a key={s} href="#contacto" className="transition-colors hover:text-primary">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-14 text-xs tracking-widest text-cream/35 uppercase">
          © {new Date().getFullYear()} Punto Verde
        </p>
      </div>
    </footer>
  );
}
