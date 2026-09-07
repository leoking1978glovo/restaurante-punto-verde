import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { getOrderStatus, setOrderStatus } from "@/lib/order-status";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [status, setStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOrderStatus().then((res) => setStatus(res.open));
  }, []);

  const toggle = async () => {
    if (status === null) return;
    setLoading(true);
    const next = !status;
    await setOrderStatus({ data: { open: next } });
    setStatus(next);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-4">
      <h1 className="mb-8 text-4xl text-cream">Panel de Control</h1>

      <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
        <p className="mb-6 text-lg text-ink/70">
          Estado actual de pedidos online
        </p>

        <div
          className={`mb-8 text-6xl font-bold ${
            status ? "text-[#5F7A3A]" : "text-red-500"
          }`}
        >
          {status === null ? "..." : status ? "ABIERTOS" : "PAUSADOS"}
        </div>

        <button
          onClick={toggle}
          disabled={loading || status === null}
          className={`rounded-full px-12 py-5 text-xl font-bold uppercase tracking-widest text-white transition-all ${
            status
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#5F7A3A] hover:bg-[#4a602e]"
          } disabled:opacity-50`}
        >
          {loading
            ? "Guardando..."
            : status
            ? "Pausar pedidos"
            : "Abrir pedidos"}
        </button>
      </div>

      <p className="mt-8 text-sm text-cream/40">
        Accede desde tu móvil en: restaurante-punto-verde.vercel.app/admin
      </p>
    </div>
  );
}