import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ChatWidgetPanel from "@/components/ChatWidgetPanel";
import { CHAT_AGENT_NAME } from "@/config/chatAgent";

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
        <div className="animate-float flex items-center gap-2">
          <div className="relative whitespace-nowrap rounded-2xl bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-md pointer-events-none select-none">
            Santiago
            <span className="absolute -right-[3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 bg-white" />
          </div>
          <button onClick={handleAvatarClick} className="relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#5F7A3A] shadow-lg shadow-[#5F7A3A]/30 transition-all duration-500 ease-out hover:scale-110 hover:shadow-xl hover:shadow-[#5F7A3A]/50" aria-label="Abrir chat con Santiago" title="Habla con Santiago">
            <span className="text-4xl" role="img" aria-label="Chef Santiago">🧑‍🍳</span>
            <span className="absolute bottom-0 right-0 z-10 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500" />
            <span className="pointer-events-none absolute -top-3 -left-3 z-20 animate-wave text-2xl">🔔</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center md:p-4 ${isMinimized ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"}`}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: isMinimized ? 0 : 1 }} exit={{ opacity: 0 }} onClick={handleMinimize} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isMinimized ? 0 : 1, scale: isMinimized ? 0.8 : 1, y: isMinimized ? 100 : 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl md:h-[600px] md:max-w-[420px] md:rounded-2xl md:border md:border-[#e5e5e5]" role="dialog" aria-label={`Chat con ${CHAT_AGENT_NAME}`}>
              <div className="flex items-center justify-between bg-[#5F7A3A] px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                    <span className="text-2xl" role="img" aria-label="Chef Santiago">🧑‍🍳</span>
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">{CHAT_AGENT_NAME}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-white/90">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      En línea - Asistente de Pedidos
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