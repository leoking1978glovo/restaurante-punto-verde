import { createServerFn } from "@tanstack/react-start";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const getOrderStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const value = await redis.get("orders:open");
      return { open: value !== false };
    } catch (error) {
      console.error("Error consultando Redis:", error);
      // Si Redis falla, asumimos cocina abierta para no bloquear pedidos
      return { open: true };
    }
  }
);

export const setOrderStatus = createServerFn({ method: "POST" })
  .validator((data: { open: boolean }) => data)
  .handler(async ({ data }) => {
    await redis.set("orders:open", data.open);
    return { open: data.open };
  });