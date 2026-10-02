import type { FormEvent } from "react";
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
              Calle Miguel Rua, 64
              <br />
              04007 Almeria
              <br />
              España
            </p>

            <p className="mt-4 text-cream/70">+34 950 67 45 42</p>
            <p className="text-cream/70">hola@punto-verde.es</p>
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

        <p className="mt-14 text-xs tracking-widest text-cream/35 uppercase">
          © {new Date().getFullYear()} Punto Verde
        </p>
      </div>
    </footer>
  );
}
