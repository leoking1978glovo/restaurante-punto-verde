import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

const fieldClass =
  "w-full rounded-xl border-2 border-cream/20 bg-cream/5 px-5 py-4 text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-primary";

export function Reservation() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("¡Mesa solicitada!", {
        description: "Te confirmamos la reserva por email en unos minutos.",
      });
      e.currentTarget?.reset?.();
    }, 700);
  };

  return (
    <section id="reservas" className="bg-fire py-24 md:py-40">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-6 md:grid-cols-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:col-span-5"
        >
          <h2 className="text-[clamp(2.75rem,9vw,6.5rem)] text-ink">Reserva tu mesa</h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ink/70">
            Abrimos reservas con 30 días de antelación. Para grupos de más de 8 personas,
            llámanos directamente.
          </p>
          <p className="mt-8 font-display text-2xl text-ink">+34 910 22 44 88</p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-3xl bg-ink p-8 md:col-span-6 md:col-start-7 md:p-10"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input required name="nombre" placeholder="Nombre" className={fieldClass} />
            <input required type="email" name="email" placeholder="Email" className={fieldClass} />
            <input required type="date" name="fecha" className={fieldClass} />
            <input required type="time" name="hora" defaultValue="21:00" className={fieldClass} />
            <select name="personas" className={`${fieldClass} md:col-span-2`} defaultValue="2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n} className="bg-ink">
                  {n} {n === 1 ? "persona" : "personas"}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full rounded-xl bg-primary py-5 font-display text-xl tracking-tight text-primary-foreground uppercase disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Confirmar reserva"}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
