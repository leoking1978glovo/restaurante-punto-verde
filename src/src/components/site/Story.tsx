import { motion } from "motion/react";
import kitchen from "@/assets/story-kitchen.jpg";

const stats = [
  { value: "10", label: "Años de pasión" },
  { value: "38", label: "Platos propios" },
  { value: "4.9", label: "Valoración media" },
];

export function Story() {
  return (
    <section id="nosotros" className="bg-ink py-24 md:py-40">
      <div className="mx-auto grid max-w-[1600px] items-center gap-14 px-6 md:grid-cols-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="md:col-span-6"
        >
          <img
            src={kitchen}
            alt="Cocina abierta con fuego vivo"
            loading="lazy"
            width={1200}
            height={1400}
            className="w-full rounded-3xl object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="md:col-span-5 md:col-start-8"
        >
          <p className="mb-6 text-xs font-semibold tracking-[0.4em] text-secondary uppercase">
            Nuestra historia
          </p>
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] text-cream">
            Empezamos con una <span className="text-fire">idea</span> y mucho entusiasmo
          </h2>
          <p className="mt-6 leading-relaxed text-cream/70">
            En 2024 abrimos Punto Verde con una misión clara: crear un espacio donde la cocina
            honesta y los ingredientes de calidad fueran los protagonistas. Sin manteles, sin
            pretensiones, solo buena comida.
          </p>
          <p className="mt-4 leading-relaxed text-cream/70">
            Hoy seguimos fieles a ese espíritu. Compramos cada mañana en el mercado, cocinamos
            con cariño y servimos platos que no piden perdón. Si buscas autenticidad, este es
            tu sitio.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl text-primary">{s.value}</p>
                <p className="mt-1 text-xs tracking-widest text-cream/50 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
