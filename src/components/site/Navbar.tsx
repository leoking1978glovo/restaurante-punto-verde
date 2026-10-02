import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const links = [
  { label: "Menú", href: "#menu" },
  { label: "Reservas", href: "#reservas" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  const [solid, setSolid] = useState(false);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-ink/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-[1600px] grid-cols-3 items-center px-6 py-5 md:px-12">
        <div className="hidden gap-8 text-xs font-semibold tracking-[0.25em] text-cream uppercase md:flex">
          {links.slice(0, 2).map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#top"
          className="col-start-1 justify-self-start font-display text-2xl tracking-tight text-cream md:col-start-2 md:justify-self-center md:text-3xl"
        >
          PUNTO<span className="text-[#5F7A3A]">VERDE</span>
        </a>

        <div className="hidden items-center justify-end gap-8 text-xs font-semibold tracking-[0.25em] text-cream uppercase md:flex">
          {links.slice(2).map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 transition-colors hover:border-primary hover:bg-primary hover:text-ink"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Pedido</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-ink">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: solo carrito (sin botón Reservar) */}
        <div className="col-start-3 flex justify-end md:hidden">
          <button
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-primary hover:bg-primary hover:text-ink"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-ink">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>
    </motion.header>
  );
}