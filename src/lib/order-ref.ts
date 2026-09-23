import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// El numero de pedido lo genera el SERVIDOR (en Redis), no el navegador.
// Asi nadie puede inventarse numeros ni repetir el de otro cliente.
// Tambien genera una clave corta aleatoria: el mensaje de "pedido web" solo
// es valido para el agente si lleva esta clave, que solo conoce el servidor.
export const createOrderRef = createServerFn({ method: "POST" }).handler(
  async () => {
    const n = await redis.incr("orders:counter");
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    return { number: 1000 + n, token };
  }
);