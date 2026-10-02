import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

export function Reservation() {
  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent("open-santiago-chat"));
  };

  return (
    <section id="reservas" className="bg-fire py-24 md:py-40">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-6 md:grid-cols-12 md:px-12 items-center">
        {/* TEXTO IZQUIERDA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:col-span-5"
        >
          <h2 className="text-[clamp(2.75rem,9vw,6.5rem)] text-ink">Reserva tu mesa</h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ink/70">
            Abrimos reservas con antelación. Para grupos de más de 8 personas,
            llámanos directamente.
          </p>
          <p className="mt-8 font-display text-2xl text-ink">+34 950 67 45 42</p>
        </motion.div>

        {/* TARJETA DEL CHEF SANTIAGO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-3xl bg-ink p-8 md:col-span-6 md:col-start-7 md:p-10 flex flex-col items-center text-center"
        >
          {/* IMAGEN DEL CHEF */}
          <div className="relative">
            <div className="text-[8rem] md:text-[10rem] leading-none">🧑‍🍳</div>
            <span className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-emerald-500 border-4 border-ink" />
          </div>

          <h3 className="mt-6 font-display text-2xl text-cream">
            Santiago, tu asistente de reservas
          </h3>
          <p className="mt-3 max-w-xs text-cream/60 leading-relaxed">
            Habla conmigo y te ayudo a reservar tu mesa en segundos. También puedo resolver dudas sobre el menú.
          </p>

          {/* BOTÓN RESERVA CON SANTIAGO */}
          <motion.button
            onClick={handleOpenChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 w-full rounded-xl bg-primary py-5 font-display text-xl tracking-tight text-primary-foreground uppercase flex items-center justify-center gap-3"
          >
            <MessageCircle className="h-6 w-6" />
            Reserva con Santiago
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}