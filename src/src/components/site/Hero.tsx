import { motion } from "motion/react";
import heroBg from "@/assets/hero-bg.jpg";

const words = ["Saborea", "la", "Revolución"];

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-end overflow-hidden bg-ink">
      <motion.img
        src={heroBg}
        alt="Textura de humo y fuego"
        width={1920}
        height={1080}
        initial={{ scale: 1.18 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/50" />
      <div className="absolute -top-40 left-1/2 h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-20 md:px-12 md:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 text-xs font-semibold tracking-[0.4em] text-secondary uppercase"
        >
          Cocina con alma · Madrid · Desde 2024
        </motion.p>

        <h1 className="max-w-[15ch] text-[clamp(3.5rem,13vw,9.5rem)] text-cream">
          {words.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: "60%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className={`mr-4 inline-block ${i === 2 ? "text-fire" : ""}`}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="max-w-md text-base leading-relaxed text-cream/70"
          >
            Ingredientes frescos, recetas sin miedo y un espacio donde cada plato cuenta una historia.
            Un sitio honesto y adictivo en pleno centro.
          </motion.p>

          <div className="flex flex-col items-center gap-4">
            <motion.a
              href="#reservas"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: [1, 1.035, 1],
              }}
              transition={{
                opacity: { delay: 0.8, duration: 0.5 },
                scale: { delay: 1.2, duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 font-display text-lg tracking-tight text-primary-foreground uppercase shadow-[var(--shadow-fire)]"
            >
              Reservar mesa
              <span aria-hidden>→</span>
            </motion.a>

            <motion.a
              href="#menu"
              aria-label="Desplázate hacia abajo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{
                opacity: { delay: 1.1, duration: 0.5 },
                y: { delay: 1.1, duration: 1.6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-cream/60 transition-colors hover:text-secondary"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
