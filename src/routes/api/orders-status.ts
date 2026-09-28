import { createFileRoute } from "@tanstack/react-router";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Dice si la cocina esta abierta o cerrada.
// La misma clave (x-api-key) que la API de mesas.
// Solo "cerrada" si el valor es false explicito; si no hay dato, abierta.
export const Route = createFileRoute("/api/orders-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.TABLES_API_KEY;
        if (!expected || request.headers.get("x-api-key") !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        try {
          const value = await redis.get("orders:open");
          const open = !(value === false || value === "false");
          return json({ ok: true, open });
        } catch {
          return json({ ok: true, open: true });
        }
      },
    },
  },
});