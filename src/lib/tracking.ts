// Live order tracking, computed from the order's creation time (pure, unit-tested), so tracking
// continues correctly when the user leaves the page and comes back.

export type OrderStatus = "Packaged" | "On the way" | "Delivered";
export type TrackableOrder = {
  createdAt: number;
  status: OrderStatus;
  method: "drone" | "courier";
};

export const STAGES: OrderStatus[] = ["Packaged", "On the way", "Delivered"];

// Demo timing: the whole delivery takes about 23 seconds.
export const PACKAGING_MS = 3_000;
export const TRAVEL_MS = 20_000;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export type TrackingState = {
  stage: 0 | 1 | 2; // index in STAGES
  packaging: number; // 0..1, how far packaging is
  travel: number; // 0..1, how far the drone/courier is along the route
};

// Stage from the clock, but never behind the saved status (the admin can move an order forward).
export function trackingState(order: TrackableOrder, now: number): TrackingState {
  const elapsed = Math.max(0, now - order.createdAt);
  const timeStage = elapsed >= PACKAGING_MS + TRAVEL_MS ? 2 : elapsed >= PACKAGING_MS ? 1 : 0;
  const stage = Math.max(timeStage, STAGES.indexOf(order.status), 0) as 0 | 1 | 2;
  if (stage === 2) return { stage, packaging: 1, travel: 1 };
  if (stage === 1)
    return { stage, packaging: 1, travel: clamp01((elapsed - PACKAGING_MS) / TRAVEL_MS) };
  return { stage, packaging: clamp01(elapsed / PACKAGING_MS), travel: 0 };
}

export const isCurrentOrder = (order: TrackableOrder, now: number) =>
  trackingState(order, now).stage < 2;

export const STATUS_TEXT = [
  "Your order is being packaged",
  "Your order is on the way",
  "Your order has been delivered",
] as const;

// Returns the same array when nothing changed, so the store does not re-save every second.
export function syncOrderStatuses<O extends TrackableOrder>(orders: O[], now: number): O[] {
  let changed = false;
  const next = orders.map((o) => {
    const status = STAGES[trackingState(o, now).stage]!;
    if (status === o.status) return o;
    changed = true;
    return { ...o, status };
  });
  return changed ? next : orders;
}

// Delivery window shown to the user, as in the design ("10:02–10:09").
// Demo orders arrive in seconds, but the window shows realistic times for the method.
const WINDOW_MIN = { drone: [10, 17], courier: [20, 30] } as const;

const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function deliveryWindow(order: TrackableOrder): string {
  const [from, to] = WINDOW_MIN[order.method];
  return `${hhmm(order.createdAt + from * 60_000)}–${hhmm(order.createdAt + to * 60_000)}`;
}

// Route on the tracking map (SVG viewBox 0 0 400 300): a curve from the pharmacy to the home.
export const ROUTE = {
  from: { x: 96, y: 232 },
  c1: { x: 150, y: 120 },
  c2: { x: 250, y: 250 },
  to: { x: 306, y: 96 },
};

export const routePath = () => {
  const { from, c1, c2, to } = ROUTE;
  return `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
};

// Point on the route at t (0 = pharmacy, 1 = home), for the moving drone/courier.
export function pointOnRoute(t: number) {
  const u = clamp01(t);
  const { from: p0, c1: p1, c2: p2, to: p3 } = ROUTE;
  const a = (1 - u) ** 3;
  const b = 3 * (1 - u) ** 2 * u;
  const c = 3 * (1 - u) * u ** 2;
  const d = u ** 3;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

// "18 Oct, 09:52"
export const formatOrderTime = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const methodLabel = (m: TrackableOrder["method"]) => (m === "drone" ? "Drone" : "Courier");
