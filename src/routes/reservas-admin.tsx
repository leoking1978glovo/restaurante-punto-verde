import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";
import { useState } from "react";

const redis = Redis.fromEnv();

const TOTAL_TABLES = Number(process.env.TABLES_TOTAL ?? 10);

const adminAction = createServerFn({ method: "POST" })
  .validator(
    (d: {
      password: string;
      action: string;
      date?: string;
      time?: string;
      table?: string;
      name?: string;
      phone?: string;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    if (
      !process.env.ADMIN_PASSWORD ||
      data.password !== process.env.ADMIN_PASSWORD
    ) {
      return { ok: false, error: "Contrasena incorrecta" };
    }

    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const TIME_RE = /^\d{2}:\d{2}$/;

    function tableIds(): string[] {
      return Array.from({ length: TOTAL_TABLES }, (_, i) =>
        String(i + 1).padStart(2, "0"),
      );
    }

    function timeToMinutes(t: string): number {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }

    function overlaps(a: string, b: string): boolean {
      const dur = 90;
      return (
        timeToMinutes(a) < timeToMinutes(b) + dur &&
        timeToMinutes(a) + dur > timeToMinutes(b)
      );
    }

    function parseBooking(value: unknown) {
      try {
        const b = (typeof value === "string" ? JSON.parse(value) : value) as {
          start: string;
          name: string;
          phone: string;
          notes?: string;
        };
        return b && typeof b.start === "string" ? b : null;
      } catch {
        return null;
      }
    }

    async function overview(date: string) {
      const raw = await redis.hgetall<Record<string, unknown>>(
        `tables:${date}`,
      );
      const tables = tableIds().map((id) => {
        const booking = raw ? parseBooking(raw[id]) : null;
        return { id, free: !booking, booking };
      });
      const reservations = Object.entries(raw ?? {})
        .map(([table, value]) => {
          const booking = parseBooking(value);
          return booking ? { table, ...booking } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.start.localeCompare(b.start));
      return { tables, reservations };
    }

    if (data.action === "overview") {
      const date = data.date ?? "";
      if (!DATE_RE.test(date)) return { ok: false, error: "Fecha invalida" };
      return { ok: true, date, ...(await overview(date)) };
    }

    if (data.action === "cancel") {
      const { date, table } = data;
      if (!date || !table) return { ok: false, error: "Faltan datos" };
      await redis.hdel(`tables:${date}`, table);
      return { ok: true, date, ...(await overview(date)) };
    }

    if (data.action === "add") {
      const { date, time, name, phone, notes } = data;
      if (
        !date ||
        !DATE_RE.test(date) ||
        !time ||
        !TIME_RE.test(time) ||
        !name ||
        !phone
      ) {
        return {
          ok: false,
          error: "Faltan datos (fecha, hora, nombre, telefono)",
        };
      }
      const raw = await redis.hgetall<Record<string, unknown>>(
        `tables:${date}`,
      );
      const occupied = new Set<string>();
      for (const [t, value] of Object.entries(raw ?? {})) {
        const b = parseBooking(value);
        if (b && overlaps(time, b.start)) occupied.add(t);
      }
      const free = tableIds().filter((t) => !occupied.has(t));
      if (free.length === 0)
        return { ok: false, error: `No hay mesas libres a las ${time}` };
      const chosen =
        data.table && free.includes(data.table) ? data.table : free[0];
      await redis.hsetnx(
        `tables:${date}`,
        chosen,
        JSON.stringify({
          start: time,
          name,
          phone,
          notes: notes ?? "",
          createdAt: new Date().toISOString(),
        }),
      );
      return { ok: true, date, table: chosen, ...(await overview(date)) };
    }

    return { ok: false, error: "Accion desconocida" };
  });

function todayMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());
}

function AdminReservas() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayMadrid());
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    time: "15:00",
    table: "",
    notes: "",
  });

  async function call(payload: any) {
    const res: any = await adminAction({ data: { password, ...payload } });
    if (res.ok) {
      setAuthed(true);
      setTables(res.tables ?? []);
      setReservations(res.reservations ?? []);
      setMsg(
        payload.action === "add" && res.table
          ? `Mesa ${res.table} asignada`
          : "",
      );
    } else {
      setMsg(res.error ?? "Error");
      if (res.error === "Contrasena incorrecta") setAuthed(false);
    }
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            background: "#2a2a2a",
            padding: 32,
            borderRadius: 12,
            width: 320,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Panel de Reservas</h2>
          <input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 12,
              borderRadius: 6,
              border: "none",
            }}
          />
          <button
            onClick={() => call({ action: "overview", date })}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#5F7A3A",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
          {msg && <p style={{ color: "#ff8080" }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1>Reservas Punto Verde</h1>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label>Fecha: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            onClick={() => call({ action: "overview", date })}
            style={{
              padding: "6px 12px",
              background: "#5F7A3A",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
          {msg && <span style={{ color: "#ffd580" }}>{msg}</span>}
        </div>

        <h2>Mesas</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {tables.map((t) => (
            <div
              key={t.id}
              style={{
                padding: 14,
                borderRadius: 10,
                background: t.free ? "#2d5a2d" : "#7a2d2d",
                minHeight: 70,
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                Mesa {t.id}
              </div>
              <div style={{ fontSize: 13 }}>
                {t.free
                  ? "Libre"
                  : `${t.booking.start} — ${t.booking.name}${
                      t.booking.notes ? ` (${t.booking.notes})` : ""
                    }`}
              </div>
            </div>
          ))}
        </div>

        <h2>Reservas del dia ({reservations.length})</h2>
        {reservations.length === 0 && <p>No hay reservas este dia.</p>}
        {reservations.map((r: any) => (
          <div
            key={r.table}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#2a2a2a",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <span>
              <strong>{r.start}</strong> — Mesa {r.table} — {r.name} — {r.phone}
              {r.notes ? ` — 📝 ${r.notes}` : ""}
            </span>
            <button
              onClick={() => call({ action: "cancel", date, table: r.table })}
              style={{
                background: "#a33",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        ))}

        <h2 style={{ marginTop: 24 }}>Anadir reserva manual</h2>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            background: "#2a2a2a",
            padding: 14,
            borderRadius: 8,
          }}
        >
          <input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "none" }}
          />
          <input
            placeholder="Telefono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "none" }}
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "none" }}
          />
          <input
            placeholder="Mesa (opcional)"
            value={form.table}
            onChange={(e) => setForm({ ...form, table: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "none", width: 100 }}
          />
          <input
            placeholder="Notas (cumpleanos, alergias...)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ padding: 8, borderRadius: 6, border: "none", flex: 1, minWidth: 180 }}
          />
          <button
            onClick={() => call({ action: "add", date, ...form })}
            style={{
              padding: "8px 14px",
              background: "#5F7A3A",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/reservas-admin")({
  component: AdminReservas,
});