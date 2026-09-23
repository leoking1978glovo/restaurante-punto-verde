import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// El numero de pedido lo genera el SERVIDOR (en Redis), no el navegador.
// Asi nadie puede inventarse numeros ni repetir el de otro cliente:
// Redis sube el contador de uno en uno y nunca da el mismo numero a dos pedidos.
export const createOrderRef = createServerFn({ method: "POST" }).handler(
  async () => {
    const n = await redis.incr("orders:counter");
    return { number: 1000 + n };
  }
);