import { motion } from "motion/react";
import { MapPin } from "lucide-react";

export function MapSection() {
  return (
    <section id="ubicacion" className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-[clamp(2.5rem,8vw,5rem)] text-ink">
            Encuéntranos
          </h2>
          <p className="mt-2 flex items-center gap-2 text-base text-ink/60 md:text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            C. Miguel Rúa, 64 , 04007 Almería
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-hidden rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3179.1234!2d-2.45420005080016!3d36.84720524533584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7a9e0695dcf579%3A0x36e30df73ceec97b!2sRestaurante%20Punto%20verde!5e0!3m2!1ses!2ses!4v1788505618914!5m2!1ses!2ses"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Ubicación Punto Verde"
            className="h-[300px] w-full md:h-[450px]"
          />
        </motion.div>
      </div>
    </section>
  );
}