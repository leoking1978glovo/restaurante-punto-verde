import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Normaliza texto: minusculas y sin acentos, para comparar nombres de ciudad
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Verifica si una direccion de entrega esta en zona de reparto (Almeria ciudad).
// Geocodifica con OpenStreetMap (Nominatim, gratuito, sin clave).
// Misma proteccion (x-api-key) que las demas APIs.
export const Route = createFileRoute("/api/validate-address")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.TABLES_API_KEY;
        if (!expected || request.headers.get("x-api-key") !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        let body: { direccion?: string };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "json invalido" }, 400);
        }
        const direccion = (body.direccion ?? "").trim();
        if (!direccion) {
          return json({ ok: false, error: "falta direccion" }, 400);
        }
        try {
          const q = encodeURIComponent(direccion + ", Almeria, España");
          const url =
            "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=es&accept-language=es&q=" +
            q;
          const r = await fetch(url, {
            headers: { "User-Agent": "punto-verde-tpv/1.0" },
          });
          if (!r.ok) {
            return json({ ok: false, error: "geocodificador no responde" }, 502);
          }
          const resultados = await r.json();
          const primero = Array.isArray(resultados) ? resultados[0] : null;
          if (!primero) {
            return json({ ok: true, found: false, inZone: false });
          }
          const addr = primero.address ?? {};
          const campos = [addr.city, addr.town, addr.village, addr.municipality];
          const enAlmeria = campos.some(
            (c) => c && normalizar(String(c)) === "almeria"
          );
          const cp = addr.postcode ? String(addr.postcode) : "";
          const inZone = enAlmeria || cp.startsWith("040");
          return json({ ok: true, found: true, inZone, direccion: primero.display_name });
        } catch {
          return json({ ok: false, error: "error consultando direccion" }, 502);
        }
      },
    },
  },
});