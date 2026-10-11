import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";
import { useEffect, useState } from "react";

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
      open?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
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

      function todayMadrid(): string {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Madrid",
        }).format(new Date());
      }

      function nowMinutesMadrid(): number {
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Madrid",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(new Date());
        const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
        const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
        return h * 60 + m;
      }

      // Reserva cumplida: paso su hora + 90 minutos -> se ignora y la mesa queda libre.
      function isExpired(date: string, start: string): boolean {
        const today = todayMadrid();
        if (date < today) return true;
        if (date > today) return false;
        return timeToMinutes(start) + 90 <= nowMinutesMadrid();
      }

      async function getReservationsOpen(): Promise<boolean> {
        const value = await redis.get<string>("reservations:open");
        return String(value) !== "0"; // por defecto: abiertas
      }

      function parseBooking(value: unknown) {
        try {
          const b = (typeof value === "string"
            ? JSON.parse(value)
            : value) as {
            start: string;
            name: string;
            phone: string;
            notes?: string;
            status?: string; // "reservada" (defecto) u "ocupada" (cliente sentado)
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
          const expired =
            booking && isExpired(date, booking.start) ? true : false;
          return {
            id,
            free: !booking || expired,
            booking: expired ? null : booking,
          };
        });
        const reservations = Object.entries(raw ?? {})
          .map(([table, value]) => {
            const booking = parseBooking(value);
            return booking && !isExpired(date, booking.start)
              ? { table, ...booking }
              : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.start.localeCompare(b.start));
        return {
          tables,
          reservations,
          reservationsOpen: await getReservationsOpen(),
        };
      }

      if (data.action === "overview") {
        const date = data.date ?? "";
        if (!DATE_RE.test(date)) return { ok: false, error: "Fecha invalida" };
        return { ok: true, date, ...(await overview(date)) };
      }

      if (data.action === "setReservations") {
        const open = data.open === true;
        await redis.set("reservations:open", open ? "1" : "0");
        return {
          ok: true,
          reservationsOpen: open,
          ...(data.date && DATE_RE.test(data.date)
            ? await overview(data.date)
            : {}),
        };
      }

      if (data.action === "cancel") {
        const { date, table } = data;
        if (!date || !table) return { ok: false, error: "Faltan datos" };
        await redis.hdel(`tables:${date}`, table);
        return { ok: true, date, ...(await overview(date)) };
      }

      if (data.action === "checkin") {
        const { date, table } = data;
        if (!date || !table) return { ok: false, error: "Faltan datos" };
        const raw = await redis.hget<string>(`tables:${date}`, table);
        const booking = raw ? parseBooking(raw) : null;
        if (!booking) {
          return { ok: false, error: `No hay reserva en la mesa ${table}` };
        }
        const updatedBooking = JSON.stringify({
          ...booking,
          status: "ocupada",
        });
        await redis.hdel(`tables:${date}`, table);
        await redis.hsetnx(`tables:${date}`, table, updatedBooking);
        return {
          ok: true,
          date,
          table,
          msg: `Mesa ${table} EN USO`,
          ...(await overview(date)),
        };
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
        // Una mesa con CUALQUIER reserva (no expirada) ese dia se considera ocupada.
        const raw = await redis.hgetall<Record<string, unknown>>(
          `tables:${date}`,
        );
        const occupied = new Set<string>();
        for (const [t, value] of Object.entries(raw ?? {})) {
          const b = parseBooking(value);
          if (b && !isExpired(date, b.start)) occupied.add(t);
        }
        const free = tableIds().filter((t) => !occupied.has(t));
        if (free.length === 0)
          return { ok: false, error: "No hay mesas disponibles ese dia" };

        const booking = {
          start: time,
          name,
          phone,
          notes: notes ?? "",
          status: "reservada",
          createdAt: new Date().toISOString(),
        };

        // Candidatas: la mesa pedida primero (si esta libre), luego el resto.
        // Se prueba una a una hasta que el guardado funcione de verdad.
        const candidates = [
          ...(data.table && free.includes(data.table) ? [data.table] : []),
          ...free.filter((t) => t !== data.table),
        ];

        for (const candidate of candidates) {
          const written = await redis.hsetnx(
            `tables:${date}`,
            candidate,
            JSON.stringify(booking),
          );
          if (written === 1) {
            return {
              ok: true,
              date,
              table: candidate,
              ...(await overview(date)),
            };
          }
        }

        return {
          ok: false,
          error: "No se pudo asignar mesa, intentalo de nuevo",
        };
      }

      return { ok: false, error: "Accion desconocida" };
    } catch (e: any) {
      // NUNCA dejar que una excepcion se trague en silencio:
      return { ok: false, error: "Error tecnico: " + (e?.message ?? e) };
    }
  });

function todayMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function AdminReservas() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayMadrid());
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsOpen, setReservationsOpen] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    time: "15:00",
    table: "",
    notes: "",
  });

  async function call(payload: any) {
    let res: any;
    try {
      res = await adminAction({ data: { password, ...payload } });
    } catch (e: any) {
      // Si la llamada falla (red, servidor, excepcion), MOSTRARLO siempre
      setMsg("Error de conexion: " + (e?.message ?? e));
      return;
    }
    if (res.ok) {
      setAuthed(true);
      if (res.tables) setTables(res.tables);
      if (res.reservations) setReservations(res.reservations);
      if (typeof res.reservationsOpen === "boolean")
        setReservationsOpen(res.reservationsOpen);
      // Limpiar el formulario tras guardar una reserva nueva
      if (payload.action === "add" && res.table) {
        setForm({ name: "", phone: "", time: "15:00", table: "", notes: "" });
      }
      setMsg(
        payload.action === "add" && res.table
          ? `Mesa ${res.table} asignada`
          : payload.action === "checkin"
            ? res.msg ?? `Mesa EN USO`
            : payload.action === "setReservations"
              ? res.reservationsOpen
                ? "Reservas ABIERTAS"
                : "Reservas CERRADAS"
              : "",
      );
    } else {
      setMsg(res.error ?? "Error");
      if (res.error === "Contrasena incorrecta") setAuthed(false);
    }
  }

  // Auto-actualizacion: cada 20 segundos recarga el dia visible.
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => {
      call({ action: "overview", date });
    }, 20000);
    return () => clearInterval(id);
  }, [authed, date, password]);

  function goDay(days: number) {
    const next = shiftDate(date, days);
    setDate(next);
    call({ action: "overview", date: next });
  }

  const isToday = date <= todayMadrid();
  const fechaLarga = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${date}T12:00:00`));

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <h1 style={{ margin: 0 }}>Reservas Punto Verde</h1>
          <button
            onClick={() =>
              call({
                action: "setReservations",
                open: !reservationsOpen,
                date,
              })
            }
            title="Abrir o cerrar las reservas online"
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              fontSize: 15,
              cursor: "pointer",
              background: reservationsOpen ? "#2d5a2d" : "#7a2d2d",
              color: "#fff",
            }}
          >
            {reservationsOpen ? "Reservas: ABIERTAS" : "Reservas: CERRADAS"}
          </button>
        </div>

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => goDay(-1)}
            disabled={isToday}
            title="Dia anterior"
            style={{
              padding: "6px 14px",
              background: isToday ? "#3a3a3a" : "#2a2a2a",
              color: isToday ? "#888" : "#fff",
              border: "1px solid #555",
              borderRadius: 6,
              cursor: isToday ? "default" : "pointer",
              fontSize: 16,
            }}
          >
            ◀
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const next = e.target.value;
              setDate(next);
              call({ action: "overview", date: next });
            }}
          />
          <button
            onClick={() => goDay(1)}
            title="Dia siguiente"
            style={{
              padding: "6px 14px",
              background: "#2a2a2a",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ▶
          </button>
          <span
            style={{
              color: "#ccc",
              fontSize: 14,
              textTransform: "capitalize",
            }}
          >
            {fechaLarga}
          </span>
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
          {tables.map((t) => {
            const enUso = !t.free && t.booking?.status === "ocupada";
            return (
              <div
                key={t.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: t.free
                    ? "#2d5a2d"
                    : enUso
                      ? "#2d4a7a"
                      : "#7a2d2d",
                  minHeight: 70,
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  Mesa {t.id}
                </div>
                <div style={{ fontSize: 13 }}>
                  {t.free
                    ? "Libre"
                    : `${enUso ? "EN USO — " : ""}${t.booking.start} — ${
                        t.booking.name
                      }${t.booking.notes ? ` (${t.booking.notes})` : ""}`}
                </div>
              </div>
            );
          })}
        </div>

        <h2>Reservas del dia ({reservations.length})</h2>
        {reservations.length === 0 && <p>No hay reservas este dia.</p>}
        {reservations.map((r: any) => {
          const enUso = r.status === "ocupada";
          return (
            <div
              key={r.table}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                background: enUso ? "#22304a" : "#2a2a2a",
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <span>
                <strong>{r.start}</strong> — Mesa {r.table} — {r.name} —{" "}
                {r.phone}
                {r.notes ? ` — 📝 ${r.notes}` : ""}
                {enUso ? " — 🔵 EN USO" : ""}
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                {!enUso && (
                  <button
                    onClick={() =>
                      call({ action: "checkin", date, table: r.table })
                    }
                    style={{
                      background: "#2d4a7a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Sentar
                  </button>
                )}
                <button
                  onClick={() =>
                    call({ action: "cancel", date, table: r.table })
                  }
                  style={{
                    background: "#a33",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  {enUso ? "Finalizar" : "Cancelar"}
                </button>
              </span>
            </div>
          );
        })}

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
            style={{
              padding: 8,
              borderRadius: 6,
              border: "none",
              flex: 1,
              minWidth: 180,
            }}
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