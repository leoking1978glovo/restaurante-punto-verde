import { motion } from "motion/react";
import kitchenVideo from "@/assets/kitchen.mp4.asset.json";
import kitchenPoster from "@/assets/story-kitchen.jpg";

export function VideoSection() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-ink md:h-[85vh]">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        poster={kitchenPoster}
        src={kitchenVideo.url}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-6 text-xs font-semibold tracking-[0.4em] text-secondary uppercase">
            Entre bambalinas
          </p>
          <h2 className="mx-auto max-w-[14ch] text-[clamp(2.75rem,10vw,7rem)] text-cream">
            El ruido de la <span className="text-fire">cocina</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-cream/70">
            Doce personas, tres fuegos y un servicio que no para. Así suena cada noche en Punto Verde.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
