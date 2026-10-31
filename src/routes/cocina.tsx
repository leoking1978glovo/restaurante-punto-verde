import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";
import { useEffect, useRef, useState } from "react";

const redis = Redis.fromEnv();

// Lectura del contador de pedidos (misma clave que usa createOrderRef).
// Protegida con la contraseña de administrador, igual que el panel de reservas.
const getOrderCounter = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    try {
      if (
        !process.env.ADMIN_PASSWORD ||
        data.password !== process.env.ADMIN_PASSWORD
      ) {
        return { ok: false, error: "Contrasena incorrecta" };
      }
      const counter = await redis.get<number>("orders:counter");
      return { ok: true, counter: Number(counter ?? 0) };
    } catch (e: any) {
      return { ok: false, error: "Error tecnico: " + (e?.message ?? e) };
    }
  });

function tono(frecuencia: number, inicio: number, duracion: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = frecuencia;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.001, ctx.currentTime + inicio);
  gain.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + inicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + inicio);
  osc.stop(ctx.currentTime + inicio + duracion + 0.05);
}

// Timbre: tres dobles campanadas agudas (dificil de confundir con un mensaje normal)
function tocarCampana() {
  try {
    const ctx = new AudioContext();
    for (let i = 0; i < 3; i++) {
      const base = i * 0.5;
      tono(1318, base, 0.18, ctx);
      tono(1760, base + 0.22, 0.3, ctx);
    }
  } catch {
    // sin audio disponible: se ignora, el aviso visual sigue
  }
}

function CocinaMonitor() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [msg, setMsg] = useState("");
  const [ultimo, setUltimo] = useState(0);
  const [aviso, setAviso] = useState(false);
  const [hora, setHora] = useState("");
  const ultimoRef = useRef(0);
  const avisoRef = useRef(false);
  avisoRef.current = aviso;

  async function consultar() {
    try {
      const res: any = await getOrderCounter({ data: { password } });
      if (!res.ok) {
        setMsg(res.error ?? "Error");
        if (res.error === "Contrasena incorrecta") setAuthed(false);
        return;
      }
      setAuthed(true);
      setMsg("");
      const c = Number(res.counter ?? 0);
      if (ultimoRef.current === 0) {
        // Primera carga: solo fijamos el punto de partida, sin sonar
        ultimoRef.current = c;
        setUltimo(c);
        return;
      }
      if (c > ultimoRef.current) {
        ultimoRef.current = c;
        setUltimo(c);
        setHora(
          new Intl.DateTimeFormat("es-ES", {
            timeZone: "Europe/Madrid",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date()),
        );
        setAviso(true);
        tocarCampana();
      }
    } catch (e: any) {
      setMsg("Error de conexion: " + (e?.message ?? e));
    }
  }

  // Consulta inicial y vigilancia cada 15 segundos
  useEffect(() => {
    if (!authed) return;
    consultar();
    const id = setInterval(consultar, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  // Si hay aviso y la cocina no lo ha visto, se repite el sonido cada 20 segundos
  useEffect(() => {
    if (!aviso) return;
    const id = setInterval(() => {
      if (avisoRef.current) tocarCampana();
    }, 20000);
    return () => clearInterval(id);
  }, [aviso]);

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
        <div style={{ background: "#2a2a2a", padding: 32, borderRadius: 12, width: 320 }}>
          <h2 style={{ marginTop: 0 }}>Campana de Pedidos</h2>
          <input
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 6, border: "none" }}
          />
          <button
            onClick={consultar}
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
        background: aviso ? "#4a1d1d" : "#1a1a1a",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Campana de Pedidos</h1>
      <p style={{ color: "#bbb" }}>
        Ultimo pedido registrado: <strong>#{ultimo}</strong>
      </p>
      <p style={{ color: "#888", fontSize: 13 }}>
        La pagina vigila cada 15 segundos. Dejala abierta en la cocina.
      </p>
      <button
        onClick={() => {
          tocarCampana();
        }}
        style={{
          marginTop: 10,
          padding: "8px 14px",
          background: "#2a2a2a",
          color: "#ccc",
          border: "1px solid #555",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Probar sonido
      </button>
      {msg && <p style={{ color: "#ff8080" }}>{msg}</p>}

      {aviso && (
        <div
          style={{
            marginTop: 30,
            background: "#7a2d2d",
            border: "3px solid #ffd580",
            borderRadius: 14,
            padding: "26px 34px",
            maxWidth: 420,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: "bold" }}>PEDIDO NUEVO</div>
          <div style={{ fontSize: 16, marginTop: 8 }}>
            Pedido #{ultimo} · llego a las {hora}
          </div>
          <div style={{ fontSize: 14, color: "#ffd9a0", marginTop: 10 }}>
            Revisa el email o Telegram de cocina
          </div>
          <button
            onClick={() => setAviso(false)}
            style={{
              marginTop: 16,
              padding: "12px 22px",
              background: "#2d5a2d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Visto
          </button>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/cocina")({
  component: CocinaMonitor,
});