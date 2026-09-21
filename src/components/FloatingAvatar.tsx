import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Receipt, X as XIcon } from "lucide-react";
import ChatWidgetPanel from "@/components/ChatWidgetPanel";
import { CHAT_AGENT_NAME } from "@/config/chatAgent";
import {
  loadLastOrder,
  clearLastOrder,
  formatOrderNumber,
  type LastOrder,
} from "@/lib/last-order";
import avatarSantiago from "@/assets/avatar-santiago-bubble.png";

const CHAT_AGENT_ID = '8054b867-8ce4-4250-8710-44feaa2cf640';
const CHAT_STORAGE_KEY = `r-${CHAT_AGENT_ID}`;

interface FloatingAvatarProps {
  pendingMessage?: string | null;
  onPendingMessageSent?: () => void;
}

export default function FloatingAvatar({
  pendingMessage: externalPendingMessage,
  onPendingMessageSent,
}: FloatingAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [localPendingMessage, setLocalPendingMessage] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setLastOrder(loadLastOrder());
    refresh();
    window.addEventListener("pv-order-saved", refresh);
    return () => window.removeEventListener("pv-order-saved", refresh);
  }, []);

  const effectivePendingMessage = localPendingMessage ?? externalPendingMessage ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (externalPendingMessage && !isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [externalPendingMessage, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isMinimized) setIsMinimized(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMinimized]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-santiago-chat", handleOpenChat);
    return () => window.removeEventListener("open-santiago-chat", handleOpenChat);
  }, []);

  // NUEVO: Escuchar pedidos del carrito
  useEffect(() => {
    const handlePedido = (e: Event) => {
      const customEvent = e as CustomEvent;
      const message = customEvent.detail?.message as string | undefined;
      if (message) {
        setLocalPendingMessage(message);
        setIsOpen(true);
        setIsMinimized(false);
      }
    };
    window.addEventListener("santiago-pending-message", handlePedido);
    return () => window.removeEventListener("santiago-pending-message", handlePedido);
  }, []);

  const handleAvatarClick = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => setIsMinimized(true);

  const handleClose = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setIsOpen(false);
    setIsMinimized(false);
    setLocalPendingMessage(null);
    setChatKey((prev) => prev + 1);
  };

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          45% { transform: rotate(14deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
        {lastOrder && (
          <button
            onClick={() => setTicketOpen(true)}
            className="absolute bottom-full right-0 mb-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-[#5F7A3A] shadow-lg transition-transform hover:scale-105"
            aria-label="Ver mi último pedido"
          >
            <Receipt className="h-4 w-4" />
            Mi pedido {formatOrderNumber(lastOrder.number)}
          </button>
        )}
        <div className="animate-float flex items-center gap-2">
          <div className="relative whitespace-nowrap rounded-2xl bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-md pointer-events-none select-none">
            Santiago
            <span className="absolute -right-[3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 bg-white" />
          </div>
          <button onClick={handleAvatarClick} className="relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#5F7A3A] shadow-lg shadow-[#5F7A3A]/30 transition-all duration-500 ease-out hover:scale-110 hover:shadow-xl hover:shadow-[#5F7A3A]/50" aria-label="Abrir chat con Santiago" title="Habla con Santiago">
            <img src={avatarSantiago} alt="Santiago" className="h-full w-full rounded-full object-cover" />
            <span className="absolute bottom-0 right-0 z-10 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
            <span className="pointer-events-none absolute -top-3 -left-3 z-20 animate-wave text-2xl">🔔</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {ticketOpen && lastOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTicketOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              role="dialog"
              aria-label="Ticket de mi último pedido"
            >
              <button
                onClick={() => setTicketOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
                aria-label="Cerrar ticket"
              >
                <XIcon className="h-4 w-4" />
              </button>

              <p className="text-center text-xs font-bold tracking-[0.3em] text-ink/40 uppercase">
                Pedido confirmado
              </p>
              <p className="mt-1 text-center font-display text-3xl text-[#5F7A3A]">
                {formatOrderNumber(lastOrder.number)}
              </p>

              <div className="mt-5 border-t-2 border-dashed border-ink/15 pt-4">
                <ul className="space-y-2 text-sm text-ink">
                  {lastOrder.lines.map((line, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>{line.replace(/^- /, "").split(" = ")[0]}</span>
                      <span className="shrink-0 font-semibold">
                        {line.split(" = ")[1]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/15 pt-4">
                <span className="font-display text-lg text-ink">Total</span>
                <span className="font-display text-2xl text-[#5F7A3A]">
                  {lastOrder.total} €
                </span>
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-ink/50">
                📍 Recoge en C. Miguel Rúa, 64 · Almería
                <br />
                Muestra este ticket al llegar
              </p>

              <button
                onClick={() => {
                  clearLastOrder();
                  setTicketOpen(false);
                }}
                className="mt-5 w-full text-center text-xs text-ink/40 underline transition-colors hover:text-red-500"
              >
                Ya recogí mi pedido (borrar ticket)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center md:p-4 ${isMinimized ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: isMinimized ? 0 : 1 }} exit={{ opacity: 0 }} onClick={handleMinimize} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isMinimized ? 0 : 1, scale: isMinimized ? 0.8 : 1, y: isMinimized ? 100 : 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl md:h-[600px] md:max-w-[420px] md:rounded-2xl md:border md:border-[#e5e5e5]" role="dialog" aria-label={`Chat con ${CHAT_AGENT_NAME}`}>
              <div className="flex items-center justify-between bg-[#5F7A3A] px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                    <img src={avatarSantiago} alt="Santiago" className="h-full w-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">{CHAT_AGENT_NAME}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-white/90">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      Asistente virtual con IA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleMinimize} className="rounded-full p-2 text-white transition-colors hover:bg-white/20" aria-label="Minimizar chat" title="Minimizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                  </button>
                  <button onClick={handleClose} className="rounded-full p-2 text-white transition-colors hover:bg-white/20" aria-label="Cerrar chat" title="Cerrar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1">
                <ChatWidgetPanel
                  key={chatKey}
                  className="h-full"
                  pendingMessage={effectivePendingMessage}
                  onPendingMessageSent={() => {
                    setLocalPendingMessage(null);
                    onPendingMessageSent?.();
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}