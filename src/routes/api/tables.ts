import { createFileRoute } from "@tanstack/react-router";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const TOTAL_TABLES = Number(process.env.TABLES_TOTAL ?? 10);
const DURATION_HOURS = 1.5;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function tableIds(): string[] {
  return Array.from({ length: TOTAL_TABLES }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Dos reservas se solapan si sus ventanas de 2 horas se cruzan
function overlaps(a: string, b: string): boolean {
  const startA = timeToMinutes(a);
  const startB = timeToMinutes(b);
  const dur = DURATION_HOURS * 60;
  return startA < startB + dur && startA + dur > startB;
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.TABLES_API_KEY;
  if (!expected) return true; // en local, sin variable, no exige clave
  return request.headers.get("x-api-key") === expected;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

interface Booking {
  start: string;
  name: string;
  phone: string;
  createdAt: string;
}

// Devuelve las mesas ocupadas que se solapan con la hora pedida
async function getOccupied(
  date: string,
  time: string,
): Promise<Map<string, Booking>> {
  const raw = await redis.hgetall<Record<string, unknown>>(`tables:${date}`);
  const occupied = new Map<string, Booking>();
  if (!raw) return occupied;
  for (const [table, value] of Object.entries(raw)) {
    try {
      // Upstash puede devolver el valor ya deserializado como objeto
      const booking = (
        typeof value === "string" ? JSON.parse(value) : value
      ) as Booking;
      if (
        booking &&
        typeof booking.start === "string" &&
        overlaps(time, booking.start)
      ) {
        occupied.set(table, booking);
      }
    } catch {
      // valor corrupto: lo ignoramos
    }
  }
  return occupied;
}

export const Route = createFileRoute("/api/tables")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isAuthorized(request))
          return json({ ok: false, error: "unauthorized" }, 401);

        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? "";
        const time = url.searchParams.get("time") ?? "";

        if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
          return json(
            {
              ok: false,
              error: "Parametros invalidos. Usa date=YYYY-MM-DD y time=HH:MM",
            },
            400,
          );
        }

        const occupied = await getOccupied(date, time);
        const freeTables = tableIds().filter((t) => !occupied.has(t));

        return json({
          ok: true,
          date,
          time,
          durationHours: DURATION_HOURS,
          totalTables: TOTAL_TABLES,
          freeTables,
          occupiedCount: occupied.size,
          occupied: [...occupied.entries()].map(([table, b]) => ({
            table,
            start: b.start,
            name: b.name,
          })),
        });
      },

      POST: async ({ request }) => {
        if (!isAuthorized(request))
          return json({ ok: false, error: "unauthorized" }, 401);

        let body: {
          action?: string;
          date?: string;
          time?: string;
          table?: string;
          name?: string;
          phone?: string;
        };
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "Body JSON invalido" }, 400);
        }

        const { action, date, time, table, name, phone } = body;

        if (
          (action !== "hold" && action !== "release") ||
          !date ||
          !DATE_RE.test(date) ||
          !time ||
          !TIME_RE.test(time)
        ) {
          return json(
            {
              ok: false,
              error:
                "Parametros invalidos. Requiere action ('hold'|'release'), date=YYYY-MM-DD, time=HH:MM",
            },
            400,
          );
        }

        const key = `tables:${date}`;

        if (action === "release") {
          if (!table) return json({ ok: false, error: "Falta table" }, 400);
          await redis.hdel(key, table);
          return json({ ok: true, released: table });
        }

        // action === "hold"
        const occupied = await getOccupied(date, time);
        const freeTables = tableIds().filter((t) => !occupied.has(t));

        if (freeTables.length === 0) {
          return json(
            {
              ok: false,
              reason: "full",
              message: `No hay mesas libres a las ${time} del ${date}.`,
              freeTables: [],
            },
            409,
          );
        }

        // Si el agente no indica mesa, asigna la primera libre
        const chosen = table && freeTables.includes(table) ? table : freeTables[0];

        const booking: Booking = {
          start: time,
          name: name ?? "",
          phone: phone ?? "",
          createdAt: new Date().toISOString(),
        };

        // hsetnx es atomico: si la mesa ya esta ocupada, no la pisa
        const result = await redis.hsetnx(key, chosen, JSON.stringify(booking));

        if (result === 0) {
          const updated = await getOccupied(date, time);
          return json(
            {
              ok: false,
              reason: "table_occupied",
              message: `La mesa ${chosen} acaba de ser ocupada.`,
              freeTables: tableIds().filter((t) => !updated.has(t)),
            },
            409,
          );
        }

        return json({ ok: true, table: chosen, date, time });
      },
    },
  },
});