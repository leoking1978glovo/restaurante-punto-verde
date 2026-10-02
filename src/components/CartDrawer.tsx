import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ChefHat,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, clearCart } =
    useCart();

  const handlePedirAhora = () => {
    if (items.length === 0) return;

    const lines = items.map(
      (item) =>
        `- ${item.name} x${item.quantity} = ${(
          item.priceValue * item.quantity
        )
          .toFixed(2)
          .replace(".", ",")} €`
    );

    const total = totalPrice.toFixed(2).replace(".", ",");

    const message = `Hola Santiago, quiero hacer este pedido:\n\n${lines.join(
      "\n"
    )}\n\nTotal: ${total} €\n\n¿Me confirmas?`;

    clearCart();
    closeCart();

    window.dispatchEvent(
      new CustomEvent("santiago-pending-message", {
        detail: { message },
      })
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="flex items-center gap-3 font-display text-2xl tracking-tight text-ink">
                <ShoppingCart className="h-6 w-6 text-primary" />
                Tu pedido
              </h2>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
                aria-label="Cerrar carrito"
              >
                <X className="h-5 w-5 text-ink" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-ink/40">
                  <ChefHat className="h-16 w-16" />
                  <p className="text-center font-medium">
                    Tu carrito está vacío
                  </p>
                  <button
                    onClick={closeCart}
                    className="rounded-full bg-primary px-6 py-2.5 font-display text-sm tracking-tight text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Ver el menú
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-semibold text-ink">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 font-display text-primary">
                          {item.price}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 transition-colors hover:bg-ink/5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-semibold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 transition-colors hover:bg-ink/5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/10 bg-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg tracking-tight text-ink">
                    Total
                  </span>
                  <span className="font-display text-2xl text-primary">
                    {totalPrice.toFixed(2).replace(".", ",")} €
                  </span>
                </div>
                <button
                  onClick={handlePedirAhora}
                  className="mt-4 w-full rounded-full bg-[#5F7A3A] py-4 font-display text-base tracking-tight text-white uppercase transition-colors hover:bg-[#4a602e]"
                >
                  Pedir ahora
                </button>
                <p className="mt-3 text-center text-xs text-ink/40">
                  Los pedidos se confirman con Santiago
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}