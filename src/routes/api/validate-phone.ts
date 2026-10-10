import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Valida un numero de movil español: 9 digitos, empieza por 6 o 7.
// Acepta espacios, puntos, guiones y parentesis intermedios.
// Misma proteccion (x-api-key) que las demas APIs.
export const Route = createFileRoute("/api/validate-phone")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.TABLES_API_KEY;
        if (!expected || request.headers.get("x-api-key") !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        let body: { telefono?: string };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "json invalido" }, 400);
        }
        const limpio = (body.telefono ?? "").replace(/[\s.\-()]/g, "");
        const valido = /^[67]\d{8}$/.test(limpio);
        return json({ ok: true, valid: valido });
      },
    },
  },
});