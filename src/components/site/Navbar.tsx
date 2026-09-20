import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";

const links = [
  { label: "Menú", href: "#menu" },
  { label: "Reservas", href: "#reservas" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const legalLinks = [
  { label: "Aviso Legal", to: "/aviso-legal" },
  { label: "Privacidad", to: "/privacidad" },
  { label: "Cookies", to: "/cookies" },
];

export function Navbar() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          solid ? "bg-ink/95 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
          {/* Izquierda: hamburguesa + logo */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-primary hover:bg-primary hover:text-ink"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <a
              href="#top"
              onClick={(e) => {
                if (window.location.pathname !== "/") {
                  e.preventDefault();
                  window.location.href = "/";
                }
              }}
              className="font-display text-2xl tracking-tight text-cream md:text-3xl"
            >
              PUNTO<span className="text-[#5F7A3A]">VERDE</span>
            </a>
          </div>

          {/* Derecha: carrito */}
          <div className="flex items-center">
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-xs font-semibold tracking-[0.25em] text-cream uppercase transition-colors hover:border-primary hover:bg-primary hover:text-ink"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline">Pedido</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-ink">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Panel lateral izquierdo */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[85vw] max-w-sm flex-col bg-ink border-r border-cream/10"
              role="dialog"
              aria-label="Menú de navegación"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-cream/10">
                <span className="font-display text-2xl tracking-tight text-cream">
                  PUNTO<span className="text-[#5F7A3A]">VERDE</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-primary hover:bg-primary hover:text-ink"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-8">
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.href}>
                      <button
                        onClick={() => goTo(l.href)}
                        className="block w-full text-left font-display text-3xl uppercase tracking-wide text-cream transition-colors hover:text-primary py-2"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 border-t border-cream/10 pt-6">
                  <p className="text-xs tracking-[0.3em] text-cream/40 uppercase">Legal</p>
                  <ul className="mt-4 space-y-3">
                    {legalLinks.map((l) => (
                      <li key={l.to}>
                        <Link
                          to={l.to}
                          onClick={() => setMenuOpen(false)}
                          className="text-sm text-cream/60 transition-colors hover:text-cream"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              <div className="border-t border-cream/10 px-6 py-5">
                <p className="text-sm text-cream/50">C. Miguel Rúa, 64 · Almería</p>
                <p className="mt-1 text-sm text-cream/50">+34 950 67 45 42</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}