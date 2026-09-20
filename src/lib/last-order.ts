const LAST_ORDER_KEY = "pv-last-order";
const ORDER_COUNTER_KEY = "pv-order-counter";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface LastOrder {
  number: number;
  lines: string[];
  total: string;
  date: number;
}

export function getNextOrderNumber(): number {
  const current = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) ?? "0", 10);
  const next = current + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(next));
  return next;
}

export function saveLastOrder(order: Omit<LastOrder, "number" | "date">) {
  const full: LastOrder = {
    ...order,
    number: getNextOrderNumber(),
    date: Date.now(),
  };
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent("pv-order-saved"));
  return full;
}

export function loadLastOrder(): LastOrder | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw) as LastOrder;
    if (Date.now() - order.date > EXPIRY_MS) {
      localStorage.removeItem(LAST_ORDER_KEY);
      return null;
    }
    return order;
  } catch {
    return null;
  }
}

export function clearLastOrder() {
  localStorage.removeItem(LAST_ORDER_KEY);
  window.dispatchEvent(new CustomEvent("pv-order-saved"));
}

export function formatOrderNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}