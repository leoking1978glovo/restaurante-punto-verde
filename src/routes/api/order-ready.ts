import { createFileRoute } from "@tanstack/react-router";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// La CAMPANA de cocina vigila este contador. Solo se incrementa cuando
// el AGENTE confirma que el pedido completo fue enviado a cocina.
// Misma proteccion (x-api-key) que las demas APIs.
export const Route = createFileRoute("/api/order-ready")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.TABLES_API_KEY;
        if (!expected || request.headers.get("x-api-key") !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        const counter = await redis.incr("orders:ready");
        return json({ ok: true, counter });
      },
    },
  },
});