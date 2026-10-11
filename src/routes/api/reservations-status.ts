import { createFileRoute } from "@tanstack/react-router";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Dice si el restaurante acepta reservas online ahora mismo.
// Lee la misma clave que usa el panel (reservations:open).
export const Route = createFileRoute("/api/reservations-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.TABLES_API_KEY;
        if (!expected || request.headers.get("x-api-key") !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        const value = await redis.get<string>("reservations:open");
        const open = String(value) !== "0"; // por defecto: abiertas
        return json({ ok: true, reservationsOpen: open });
      },
    },
  },
});