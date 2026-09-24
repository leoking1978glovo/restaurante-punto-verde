import type { FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

const hours = [
  ["Martes – Domingo", "12:00 – 16:30"],
];

const socials = ["Instagram", "TikTok"];

export function Footer() {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("¡Bienvenido a la lista!", {
      description: "Te avisamos de cada nueva carta.",
    });
  };

  return (
    <footer id="contacto" className="bg-ink pt-24 pb-10">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <h2 className="text-[clamp(2.5rem,10vw,8rem)] text-cream/10">
          PUNTO VERDE
        </h2>

        <div className="mt-12 grid gap-12 border-t border-cream/15 pt-12 md:grid-cols-4">
          <div>
            <h3 className="text-sm tracking-[0.3em] text-primary uppercase">
              Dónde
            </h3>

            <p className="mt-4 leading-relaxed text-cream/70">
            C. Miguel Rúa, 64
              <br />
              04009 Almeria
              <br />
              España
            </p>

            <p className="mt-4 text-cream/70">+34 950 67 45 42</p>
            <p className="text-cream/70">restaurantpuntoverde.es</p>
          </div>

          <div>
            <h3 className="text-sm tracking-[0.3em] text-primary uppercase">
              Horarios
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              {hours.map(([d, h]) => (
                <li key={d}>
                  <span className="block font-semibold text-cream">
                    {d}
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 md:flex-row md:items-center md:justify-between md:pr-32">
          <p className="text-xs tracking-widest text-cream/35 uppercase">
            © {new Date().getFullYear()} Punto Verde
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-widest uppercase">
            <Link to="/aviso-legal" className="text-cream/50 hover:text-cream transition-colors">
              Aviso Legal
            </Link>
            <Link to="/privacidad" className="text-cream/50 hover:text-cream transition-colors">
              Privacidad
            </Link>
            <Link to="/cookies" className="text-cream/50 hover:text-cream transition-colors">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}