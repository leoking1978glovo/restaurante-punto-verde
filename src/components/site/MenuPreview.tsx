import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "motion/react";
import { menu } from "@/data/restaurant";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, X, Check, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

type MenuChoice = { label: string; options: string[] };

type SelectedItem = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  category: string;
  choices?: MenuChoice[];
} | null;

function parsePrice(priceStr: string): number {
  const clean = priceStr.replace(/[€\s]/g, "").replace(",", ".");
  const firstValue = clean.split("-")[0];
  return parseFloat(firstValue) || 0;
}

const GAP = 20;

export function MenuPreview() {
  const { addItem } = useCart();
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  // Elecciones del cliente DENTRO de la ventanita del Menú del día.
  // Guarda, para el plato abierto, qué opción eligió en cada grupo (proteína, bebida...).
  const [modalChoices, setModalChoices] = useState<Record<number, string>>({});

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    setMaxDrag(Math.max(0, track.scrollWidth - viewport.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const itemWidth = () => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 300;
    return (track.children[0] as HTMLElement).offsetWidth + GAP;
  };

  const snapTo = useCallback(
    (target: number) => {
      const clamped = Math.max(-maxDrag, Math.min(0, target));
      const step = itemWidth();
      const snapped = Math.round(clamped / step) * step;
      animate(x, Math.max(-maxDrag, Math.min(0, snapped)), {
        type: "spring",
        stiffness: 300,
        damping: 32,
      });
    },
    [maxDrag, x],
  );

  const onDragEnd = () => {
    const velocity = x.getVelocity();
    const projected = x.get() + velocity * 0.2;
    snapTo(projected);
  };

  const go = (dir: 1 | -1) => {
    snapTo(x.get() - dir * itemWidth());
  };

  const getItemId = (item: { name: string }, category: string) =>
    `${category}-${item.name}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

  // Marca o desmarca una opción dentro de la ventanita (permite cambiar de idea)
  const toggleModalChoice = (groupIndex: number, option: string) => {
    setModalChoices((prev) => {
      const next = { ...prev };
      if (next[groupIndex] === option) {
        delete next[groupIndex];
      } else {
        next[groupIndex] = option;
      }
      return next;
    });
  };

  // True si el plato abierto tiene grupos de elección y TODOS están elegidos
  const modalReady =
    !selectedItem?.choices ||
    selectedItem.choices.length === 0 ||
    selectedItem.choices.every((_, i) => Boolean(modalChoices[i]));

  const handlePriceClick = (
    item: {
      name: string;
      price: string;
      description: string;
      choices?: MenuChoice[];
    },
    category: string,
  ) => {
    setModalChoices({}); // ventanita nueva, elecciones vacías
    setSelectedItem({
      id: getItemId(item, category),
      name: item.name,
      price: item.price,
      priceValue: parsePrice(item.price),
      category,
      choices: item.choices,
    });
  };

  const handleConfirm = () => {
    if (!selectedItem || !modalReady) return;

    // Platos con elección (Menú del día): el nombre lleva las opciones elegidas
    if (selectedItem.choices && selectedItem.choices.length > 0) {
      const chosen = selectedItem.choices.map((g, i) => modalChoices[i]);
      const nameWithChoices = `${selectedItem.name} (${chosen.join(" + ")})`;
      addItem({
        id: `${selectedItem.id}-${chosen
          .join("-")
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        name: nameWithChoices,
        price: selectedItem.price,
        priceValue: selectedItem.priceValue,
        category: selectedItem.category,
      });
    } else {
      addItem({
        id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        priceValue: selectedItem.priceValue,
        category: selectedItem.category,
      });
    }
    setSelectedItem(null);
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  return (
    <section id="menu" className="relative bg-[#FFF0E6] py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-4 md:px-12">
        <div className="flex items-end justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[clamp(2.5rem,8vw,5rem)] text-ink"
          >
            La carta
          </motion.h2>

          {/* FLECHA INDICADORA: al lado del titulo, solo en movil, GRANDE */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-2 md:hidden"
          >
            <span className="text-base font-semibold text-primary">Desliza</span>
            <div className="flex">
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="h-7 w-7 text-primary" />
              </motion.div>
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              >
                <ChevronRight className="h-7 w-7 text-primary/70" />
              </motion.div>
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                <ChevronRight className="h-7 w-7 text-primary/40" />
              </motion.div>
            </div>
          </motion.div>

          <div className="hidden gap-3 md:flex">
            <button
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-cream"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-cream"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div ref={viewportRef} className="mt-8 overflow-hidden md:mt-12">
        <motion.div
          ref={trackRef}
          drag="x"
          style={{ x }}
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          className="flex cursor-grab gap-5 active:cursor-grabbing px-4 md:gap-6 md:px-12"
        >
          {menu.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="flex w-[88vw] shrink-0 flex-col rounded-[2rem] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 md:w-[340px] md:p-5"
            >
              <h3 className="border-b-2 border-primary/30 pb-2 text-xl font-bold text-ink md:text-xl">
                {cat.title}
              </h3>
              <ul className="mt-4 flex flex-1 flex-col justify-center space-y-3 md:mt-3 md:justify-start md:space-y-2">
                {cat.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-ink md:text-sm">
                        {item.name}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                      <button
                        type="button"
                        onClick={() => handlePriceClick(item, cat.title)}
                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-display text-sm text-primary transition-colors hover:bg-primary hover:text-cream md:px-2.5 md:py-0.5 md:text-sm"
                      >
                        <ShoppingCart className="h-4 w-4 md:h-3 md:w-3" />
                        {item.price}
                      </button>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground md:mt-0.5 md:text-xs">
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <p className="mt-4 text-center text-xs text-ink/40 md:hidden">
        ← Desliza para ver más categorías →
      </p>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="font-display text-xl tracking-tight text-ink">
                {selectedItem.choices ? "Configura tu menú" : "¿Añadir al pedido?"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                <span className="font-semibold text-ink">
                  {selectedItem.name}
                </span>
                <br />
                <span className="font-display text-lg text-primary">
                  {selectedItem.price}
                </span>
              </p>

              {selectedItem.choices && (
                <div className="mt-4 space-y-3">
                  {selectedItem.choices.map((group, groupIndex) => (
                    <div key={group.label}>
                      <p className="text-[11px] font-semibold tracking-wide text-ink/60 uppercase">
                        {group.label}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {group.options.map((option) => {
                          const isSelected = modalChoices[groupIndex] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleModalChoice(groupIndex, option)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary text-cream"
                                  : "border-primary/30 bg-white text-ink/70 hover:border-primary hover:text-primary"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 font-semibold text-ink transition-colors hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!modalReady}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-colors ${
                    modalReady
                      ? "bg-[#5F7A3A] hover:bg-[#4a602e]"
                      : "cursor-not-allowed bg-[#5F7A3A]/40"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Sí, añadir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}