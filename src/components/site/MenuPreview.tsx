import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { menu } from "@/data/restaurant";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, X, Check } from "lucide-react";

type SelectedItem = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  category: string;
} | null;

function parsePrice(priceStr: string): number {
  const clean = priceStr.replace(/[€\s]/g, "").replace(",", ".");
  const firstValue = clean.split("-")[0];
  return parseFloat(firstValue ?? "") || 0;
}

export function MenuPreview() {
  const { addItem } = useCart();
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  const handlePriceClick = (
    item: {
      name: string;
      price: string;
      description: string;
    },
    category: string
  ) => {
    const id = `${category}-${item.name}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    setSelectedItem({
      id,
      name: item.name,
      price: item.price,
      priceValue: parsePrice(item.price),
      category,
    });
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    addItem({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      priceValue: selectedItem.priceValue,
      category: selectedItem.category,
    });
    setSelectedItem(null);
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  return (
    <section id="menu" className="relative bg-cream py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[clamp(2.75rem,9vw,6.5rem)] text-ink md:col-span-7"
          >
            La carta
          </motion.h2>
        </div>

        <div className="mt-16 grid gap-x-14 gap-y-16 md:grid-cols-2 xl:grid-cols-4">
          {menu.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={i % 2 === 1 ? "xl:mt-16" : ""}
            >
              <h3 className="border-b-4 border-ink pb-3 text-3xl text-ink">
                {cat.title}
              </h3>
              <ul className="mt-6 space-y-6">
                {cat.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold text-ink">{item.name}</span>
                      <span className="h-px flex-1 bg-border" />
                      <button
                        type="button"
                        onClick={() => handlePriceClick(item, cat.title)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-display text-lg text-primary transition-colors hover:bg-primary/20 hover:text-primary/80"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {item.price}
                      </button>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* POPUP DE CONFIRMACIÓN CON ANIMACIÓN */}
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
                ¿Añadir al pedido?
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
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5F7A3A] py-3 font-semibold text-white transition-colors hover:bg-[#4a602e]"
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